"use client"

import { useState } from "react"
import { LogOutIcon } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SignOutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 确认后执行的真实动作（本原型里是重置本地会话状态）。 */
  onConfirm: () => void
  accountEmail?: string
  testId?: string
}

/**
 * 退出登录确认。原型没有真实鉴权，因此这里明确说明会发生什么，
 * 而不是假装完成一次登录态切换之后又把数据留在原地。
 */
export function SignOutDialog({
  open,
  onOpenChange,
  onConfirm,
  accountEmail,
  testId,
}: SignOutDialogProps) {
  const [pending, setPending] = useState(false)

  const confirm = () => {
    setPending(true)
    onConfirm()
    setPending(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid={testId} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign out of the prototype?</DialogTitle>
          <DialogDescription>
            This is a frontend-only prototype with no authentication. Continuing resets the
            local session{accountEmail ? ` for ${accountEmail}` : ""} back to its initial
            state — every customer, task and filter returns to how it started.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter showCloseButton={false}>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={confirm}
            disabled={pending}
            data-testid={testId ? `${testId}-confirm` : undefined}
            className={cn("gap-1.5")}
          >
            <LogOutIcon />
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
