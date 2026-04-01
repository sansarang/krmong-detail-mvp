'use client'
import { useEffect } from 'react'
import { initializePaddle } from '@paddle/paddle-js'

export default function PaddleProvider() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    if (!token) {
      console.log('Paddle token not set — skipping initialization')
      return
    }
    initializePaddle({
      environment: 'production',
      token,
    }).then(paddle => {
      if (paddle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).PaddleInstance = paddle
      }
    }).catch(err => {
      console.error('Paddle init error:', err)
    })
  }, [])

  return null
}
