"use client";

import React, { useState } from "react";
import { LinkItem } from "@/types";
import { deleteLinkFromFirestore } from "@/lib/links";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from "@/components/ui";
import { AlertTriangle, Trash2, AlertCircle, Loader2 } from "lucide-react";

export interface DeleteLinkDialogProps {
  link: LinkItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteLink?: (deletedId: string) => void;
  onDeletingChange?: (isDeleting: boolean) => void;
}

export function DeleteLinkDialog({
  link,
  open,
  onOpenChange,
  onDeleteLink,
  onDeletingChange,
}: DeleteLinkDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const updateDeletingState = (nextState: boolean) => {
    setIsDeleting(nextState);
    onDeletingChange?.(nextState);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return;
    if (!nextOpen) {
      setDeleteError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleConfirmDelete = async () => {
    setDeleteError(null);
    updateDeletingState(true);
    try {
      await Promise.all([
        deleteLinkFromFirestore(link.id),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);
      onDeleteLink?.(link.id);
      onOpenChange(false);
    } catch (error) {
      console.error(
        "Firestore 링크 삭제 실패 (users/anonymous/links):",
        error
      );
      setDeleteError(
        error instanceof Error
          ? `링크 삭제 중 오류가 발생했습니다: ${error.message}`
          : "Firestore에서 링크를 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      updateDeletingState(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#FFFBEB] max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="destructive"
              size="sm"
              className="font-black shadow-[1.5px_1.5px_0px_#000000]"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>DELETE LINK</span>
            </Badge>
            {isDeleting && (
              <Badge
                variant="secondary"
                size="sm"
                className="font-black bg-[#FEF08A] text-black gap-1 shadow-[1.5px_1.5px_0px_#000000]"
              >
                <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
                <span>삭제 중...</span>
              </Badge>
            )}
          </div>
          <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>
            선택하신 링크를 목록에서 삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-1">
          {/* 삭제 대상 링크 이름 및 정보 표시 */}
          <div
            className={`flex items-center gap-3 p-3.5 rounded-[10px] border-[2px] border-black bg-white shadow-[2.5px_2.5px_0px_#000000] text-left transition-opacity ${
              isDeleting ? "opacity-60" : "opacity-100"
            }`}
          >
            <span className="flex-shrink-0 text-lg w-8 h-8 rounded-[6px] bg-zinc-100 flex items-center justify-center border-[1.5px] border-black shadow-[1px_1px_0px_#000000]">
              {link.icon || "🔗"}
            </span>
            <div className="min-w-0 flex-1 flex flex-col">
              <span className="font-black text-sm sm:text-base text-black truncate">
                {link.title}
              </span>
              <span className="text-xs font-semibold text-black/60 truncate">
                {link.url}
              </span>
            </div>
          </div>

          {/* 빨간색 경고 문구 */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border-[2px] border-red-600 bg-[#FEE2E2]/80 text-red-600 text-xs sm:text-sm font-black">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 stroke-[2.5]" />
            <span className="text-red-600">이 작업은 되돌릴 수 없습니다</span>
          </div>

          {/* 삭제 진행 중 로딩 표시 배너 */}
          {isDeleting && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] border-[2px] border-black bg-[#FEF08A] text-black text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000000]"
            >
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5] shrink-0" />
              <span>파이어베이스에서 링크를 삭제하는 중입니다...</span>
            </div>
          )}

          {deleteError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-[8px] border-[2px] border-black bg-[#FEE2E2] text-red-900 text-xs font-bold shadow-[2px_2px_0px_#000000]"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => handleOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>삭제 중...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>삭제하기</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
