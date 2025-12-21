import { useState, useRef } from "react";
import { useTranslations } from 'next-intl';
import { Toaster, toast } from 'sonner';
// 导入存储服务
import { IStorageService } from '@/app/services/storage';
import { StorageFactory } from '@/app/services/storage-factory';
import { FileMetadata } from '@/app/support/file-metadata';

import { convertSample, JsonSample, BioSample } from '@/app/support/conversions';
//导入dialog组件
export const ExportDialog = ({ fileMetadata, clearAnnotations }: { fileMetadata: FileMetadata | null, clearAnnotations: Function }) => {
  const t = useTranslations('ExportDialog');
  const storageService: IStorageService = StorageFactory.createStorage()
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const jsonFormatRef = useRef<HTMLInputElement | null>(null);
  const bioFormatRef = useRef<HTMLInputElement | null>(null);

  const [annotations, setAnnotations] = useState<any[]>([])

  // 从存储中获取所有当前文件的标注结果，而不是仅本地状态
  const loadFullAnnotations = async () => {
    if (!fileMetadata) {
      setAnnotations([])
      return annotations
    }
    try {
      // 使用新的getWithPrefix方法获取所有相关数据
      const prefix = `${fileMetadata.md5}_`;
      const annotationsFromStorage = await storageService.getWithPrefix(prefix);

      // 提取values并过滤掉null值
      const validAnnotations = Object.values(annotationsFromStorage)
        .filter(annotation => annotation !== null);
      setAnnotations(validAnnotations)
      return validAnnotations;
    } catch (error) {
      console.error("Failed to get all annotations from storage:", error);
      setAnnotations([])
      return []
    }
  };

  // 导出标注结果
  const exportAnnotations = async () => {
    const usingBio = bioFormatRef.current?.checked
    if (!fileMetadata) {
      toast.error(t('pleaseUploadFile'));
      closeDialog()
      return;
    }

    // 执行导出
    let annotationsToExport = annotations;
    if (annotationsToExport.length == 0) {
      toast.error(t('noDataToExport'));
      closeDialog()
      return;
    }
    if (usingBio) {
      //convert to bio
      annotationsToExport = annotationsToExport.map(item => {
        return convertSample(item)
      })
    }
    // 合并所有标注结果为jsonl
    const jsonlContent = annotationsToExport
      .map(annotation => JSON.stringify(annotation))
      .join("\n");

    // 创建下载链接
    const blob = new Blob([jsonlContent], { type: "application/jsonl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `annotations_${fileMetadata.md5}.jsonl`; // 使用md5作为文件名一部分
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 清空存储中当前文件相关的所有记录
    const clearStorage = async () => {
      try {
        const prefix = `${fileMetadata.md5}_`;
        await storageService.deleteKeysWithPrefix(prefix);

        // 清空本地状态中的annotations
        clearAnnotations()
      } catch (error) {
        console.error("Failed to clear annotations from storage:", error);
        return
      }
    };

    clearStorage();
    closeDialog()
    toast.success(t('exportSucceed'))
  };

  const openDialog = () => {
    if (dialogRef && dialogRef.current) {
      loadFullAnnotations()
      dialogRef.current.showModal()
    }
  }

  const closeDialog = () => {
    if (dialogRef && dialogRef.current)
      dialogRef.current.close()
  }
  return (
    <div>
      {/* 导出按钮 */}
      <button
        onClick={openDialog}
        disabled={!fileMetadata}
        className="btn btn-outline btn-success"
      >
        {t('exportAnnotations')}
      </button>
      <Toaster position="top-center" richColors={true} />
      <dialog
        className="modal"
        ref={dialogRef}
      >
        <div className="modal-box text-base-content w-9/12 max-w-5xl">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">{t('exportAnnotations')}</h3>
          <p className="py-4">{t('exportFileMD5')} : {fileMetadata?.md5}</p>
          <p className="py-4">{t('exportAnnotationCount')} : {annotations.length}/{fileMetadata?.lineCount}</p>
          
          <p className="py-4">{t('exportFormat')} :</p>
          <div className="tabs tabs-border">
              <input type="radio" ref={jsonFormatRef} name="export-format" className="tab" aria-label="JSON" defaultChecked />
              <div className="tab-content border-base-300 bg-base-100 p-10 whitespace-pre-wrap">
                <JsonSample/>
              </div>

              <input type="radio" ref={bioFormatRef} name="export-format" className="tab" aria-label="BIO" />
              <div className="tab-content border-base-300 bg-base-100 p-10 whitespace-pre-wrap">
                <BioSample/>
              </div>
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={exportAnnotations}>{t('confirmExportDialog')}</button>
          </div>
          
        </div>
      </dialog>
    </div>
  )
}

