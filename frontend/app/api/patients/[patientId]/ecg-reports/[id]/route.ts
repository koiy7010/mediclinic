import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; id: string }> }
) {
  try {
    const { patientId, id } = await params;
    
    const response = await fetch(`${BACKEND_URL}/api/patients/${patientId}/ecg-reports/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ECG report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ECG report' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; id: string }> }
) {
  try {
    const { patientId, id } = await params;
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/patients/${patientId}/ecg-reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating ECG report:', error);
    return NextResponse.json(
      { error: 'Failed to update ECG report' },
      { status: 500 }
    );
  }
}