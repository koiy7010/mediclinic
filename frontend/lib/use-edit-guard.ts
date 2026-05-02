'use client'

import { useCallback } from 'react'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/use-toast'

const EDIT_WINDOW_HOURS = 72

/** Returns hours elapsed since a result date string (yyyy-MM-dd) */
function hoursElapsed(resultDate: string): number {
  return (Date.now() - new Date(resultDate).getTime()) / (1000 * 60 * 60)
}

export function useEditGuard() {
  const { confirm, ConfirmDialog } = useConfirm()

  /**
   * Call before saving an existing visit.
   * Returns true if the save should proceed, false if the user cancelled.
   * Also logs the amendment to the activity log.
   */
  const guardEdit = useCallback(async (opts: {
    resultDate: string        // the visit's result date (yyyy-MM-dd)
    patientId: string
    patientName: string
    module: string            // e.g. 'X-Ray' | 'Laboratory'
    detail?: string           // e.g. 'Hematology'
  }): Promise<boolean> => {
    const hours = hoursElapsed(opts.resultDate)
    const isLocked = hours > EDIT_WINDOW_HOURS

    if (isLocked) {
      toast({
        title: 'Record Locked',
        description: `This record is older than ${EDIT_WINDOW_HOURS} hours and can no longer be edited.`,
        variant: 'destructive',
      })
      return false
    }

    const hoursLeft = Math.floor(EDIT_WINDOW_HOURS - hours)
    const proceeded = await confirm({
      title: 'Editing a Medical Record',
      message: `You are modifying an existing ${opts.module} record from ${opts.resultDate}. Medical records are legal documents — all changes are logged.\n\nEdit window closes in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.`,
      confirmLabel: 'Proceed & Log Edit',
      cancelLabel: 'Cancel',
      variant: 'warning',
    })

    if (!proceeded) return false

    // Fire-and-forget audit log
    apiClient.activityLogs.create({
      action: 'updated',
      module: opts.module,
      patientId: opts.patientId,
      patientName: opts.patientName,
      details: `Medical record amended — ${opts.module}${opts.detail ? ` / ${opts.detail}` : ''} (visit: ${opts.resultDate})`,
      user: 'system',
    }).catch(() => {/* non-blocking */})

    return true
  }, [confirm])

  return { guardEdit, ConfirmDialog }
}
