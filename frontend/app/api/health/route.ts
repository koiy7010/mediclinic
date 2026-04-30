import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    // Check if backend is reachable
    const response = await fetch(`${BACKEND_URL}/actuator/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const backendHealth = response.ok ? 'UP' : 'DOWN';
    const backendData = response.ok ? await response.json() : null;

    return NextResponse.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      frontend: {
        status: 'UP',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
      backend: {
        status: backendHealth,
        url: BACKEND_URL,
        data: backendData,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        frontend: {
          status: 'UP',
          version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        },
        backend: {
          status: 'DOWN',
          url: BACKEND_URL,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 503 }
    );
  }
}