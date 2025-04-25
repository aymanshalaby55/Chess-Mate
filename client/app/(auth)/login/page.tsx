import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import SignInButton from "@/components/shared/SignInButton"


export const metadata: Metadata = {
  title: "Sign In - Chess Masters",
  description: "Sign in to your Chess Masters account",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
        <Link href="/" className="flex items-center text-sm text-green-400 mb-8 hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>

        <div className="w-full space-y-6 bg-zinc-900 p-8 rounded-lg border border-zinc-800">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Welcome to Chess Masters</h1>
            <p className="text-zinc-400">Sign in to continue to your account</p>
          </div>

          <div className="space-y-4">
            <SignInButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-900 px-2 text-zinc-400">Or continue with</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white">
                Play as Guest
              </Button>
              <p className="text-xs text-center text-zinc-500">Limited features available in guest mode</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-green-400 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-green-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
