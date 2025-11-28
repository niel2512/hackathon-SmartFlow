// Production error handling utilities
import type { NextResponse } from "next/server"
import { NextResponse as NR } from "next/server"

export interface ApiErrorResponse {
  error: string
  code: string
  details?: any
  timestamp: string
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: any,
  ) {
    super(message)
  }
}

// Standard error responses
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  INVALID_OPERATION: "INVALID_OPERATION",
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error("[API Error]", error)

  if (error instanceof ApiError) {
    return NR.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode },
    )
  }

  if (error instanceof Error) {
    return NR.json(
      {
        error: error.message,
        code: ErrorCodes.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }

  return NR.json(
    {
      error: "An unexpected error occurred",
      code: ErrorCodes.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    },
    { status: 500 },
  )
}

export function createErrorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: any,
): NextResponse<ApiErrorResponse> {
  return NR.json(
    {
      error: message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  )
}
