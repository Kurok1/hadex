/**
 * Copyright 2025 Kurok1
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";
import { useState, useEffect, useRef } from "react";
import SparkMD5 from "spark-md5";
import { useTranslations } from 'next-intl';

// 文件元数据类
import { FileMetadata } from "@/app/support/file-metadata";

// 导入存储服务
import { IStorageService } from '@/app/services/storage';
import { StorageFactory } from '@/app/services/storage-factory';

// 导入navbar组件
import Navbar from '@/app/components/layouts/Navbar';
import { ExportDialog } from "./components/ExportDialog";

// 合并后的文本标注组件
export default function TextAnnotation() {
  // 使用工厂模式创建存储服务实例 - 后续可通过环境变量轻松替换为其他实现
  const t = useTranslations('TextAnnotation');
  const storageService: IStorageService = StorageFactory.createStorage();
  // 文件上传相关
  const [jsonlData, setJsonlData] = useState<{ text: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [currentText, setCurrentText] = useState("");

  // 文本选择相关
  const [selectedText, setSelectedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const toPageRef = useRef<HTMLInputElement | null>(null);

  // 标注相关
  const [labels, setLabels] = useState<Set<string>>(new Set());
  const [annotations, setAnnotations] = useState<Record<number, any>>({});
  const [newLabelInput, setNewLabelInput] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  // 当currentLine变化时，更新textarea的内容并从IndexedDB读取数据
  useEffect(() => {
    let isMounted = true;

    const loadAnnotationsFromDB = async () => {
      if (!fileMetadata || !jsonlData.length) return;

      try {
        const key = `ner_${fileMetadata.md5}_line_${currentLine}`;
        const savedAnnotation = await storageService.get(key);

        if (isMounted) {
          if (savedAnnotation) {
            // 读取到数据，更新annotations状态
            setAnnotations(prev => ({
              ...prev,
              [currentLine]: savedAnnotation
            }));
          } else {
            // 没有数据，清空当前行的标注
            setAnnotations(prev => {
              const newAnnotations = {...prev};
              delete newAnnotations[currentLine];
              return newAnnotations;
            });
          }
        }
      } catch (error) {
        console.error("Failed to load annotations from IndexedDB:", error);
      }
    };

    // 更新当前文本
    if (jsonlData.length > 0 && currentLine >= 0 && currentLine < jsonlData.length) {
      setCurrentText(jsonlData[currentLine].text);
    } else {
      setCurrentText("");
    }

    // 切换行号时重置状态
    setSelectedText("");
    setSelectedLabel(null);
    setNewLabelInput("");

    // 从DB加载数据
    loadAnnotationsFromDB();

    return () => {
      isMounted = false;
    };
  }, [jsonlData, currentLine, fileMetadata]);

  // 解析jsonl文件
  const parseJsonl = (content: string): { text: string }[] => {
    return content
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line.trim()));
  };

  // 计算文件md5和行数
  const calculateFileMetadata = (content: string): FileMetadata => {
    const md5 = SparkMD5.hash(content);
    const lineCount = content.split("\n").filter((line) => line.trim() !== "").length;
    return new FileMetadata(md5, lineCount);
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件格式
    if (file.name.split(".").pop()?.toLowerCase() !== "jsonl") {
      alert(t('pleaseUploadJsonlFile'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const data = parseJsonl(content);
      const metadata = calculateFileMetadata(content);

      setJsonlData(data);
      setCurrentLine(0);
      setFileMetadata(metadata);
    };
    reader.readAsText(file);
  };

  // 处理文本选择
  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const text = selection.toString().trim();
      setSelectedText(text);
    }
  };

  const handleMouseUp = () => {
    handleTextSelect();
  };

  // 上一行
  const handlePrevLine = () => {
    if (currentLine > 0) {
      setCurrentLine(currentLine - 1);
    }
  };

  // 下一行
  const handleNextLine = () => {
    if (fileMetadata && currentLine < fileMetadata.lineCount - 1) {
      setCurrentLine(currentLine + 1);
    }
  };

  const handleToPage = () => {
    if (toPageRef && toPageRef.current) {
      const value = parseInt(toPageRef.current.value)
      setCurrentLine(value - 1)
    }
  }

  // 处理label选择
  const handleLabelSelect = (label: string) => {
    setSelectedLabel(label);
    setNewLabelInput(label); // 选中已有标签时，将标签内容显示在输入框中
  };

  // 处理新label输入
  const handleNewLabelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLabelInput(e.target.value);
  };

  // 保存标注
  const saveAnnotation = () => {
    if (!selectedText) {
      alert(t('pleaseSelectText'));
      return;
    }

    let finalLabel: string;

    // 如果有新输入的label，使用新的并添加到labels集合
    if (newLabelInput.trim()) {
      finalLabel = newLabelInput.trim();
      setLabels(prev => new Set(prev).add(finalLabel));
    } else if (selectedLabel) {
      finalLabel = selectedLabel;
    } else {
      alert(t('pleaseSelectOrEnterLabel'));
      return;
    }

    // 查找选中文本在原始文本中的所有位置 - 左右闭合区间
    const positions: [number, number][] = [];
    let startIndex = 0;

    while (startIndex < currentText.length) {
      const index = currentText.indexOf(selectedText, startIndex);
      if (index === -1) break;

      const endIndex = index + selectedText.length - 1;
      positions.push([index, endIndex]);
      startIndex = index + selectedText.length;
    }

    // 更新标注记录
    const updatedAnnotations = { ...annotations };

    // 如果当前行已有标注，更新它
    if (updatedAnnotations[currentLine]) {
      const existingAnnotations = updatedAnnotations[currentLine];

      // 如果已有相同的label，合并文本和位置
      if (existingAnnotations.label[finalLabel]) {
        existingAnnotations.label[finalLabel] = {
          ...existingAnnotations.label[finalLabel],
          [selectedText]: [...(existingAnnotations.label[finalLabel][selectedText] || []), ...positions]
        };
      } else {
        // 否则添加新的label
        existingAnnotations.label[finalLabel] = {
          [selectedText]: positions
        };
      }
    } else {
      // 否则创建新的标注记录
      updatedAnnotations[currentLine] = {
        text: currentText,
        label: {
          [finalLabel]: {
            [selectedText]: positions
          }
        }
      };
    }

    setAnnotations(updatedAnnotations);

    // 将当前行的标注结果保存到存储
    if (fileMetadata) {
      const currentAnnotation = updatedAnnotations[currentLine];
      const key = `ner_${fileMetadata.md5}_line_${currentLine}`;

      storageService.put(key, currentAnnotation)
        .catch(error => console.error("Failed to save annotation to storage:", error));
    }

    // 重置状态
    setSelectedText("");
    setSelectedLabel(null);
    setNewLabelInput("");
  };

  //清除所有的Annotations
  const clearAllAnnotations = () => {
    setAnnotations({});
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-base-100">
      {/* Navbar */}
      <Navbar />

      {/* 文件上传区域 */}
      <div className="p-4 border-b border-base-300 bg-base-100 flex flex-wrap gap-4 items-center justify-between overflow-hidden">
        <div>
          <label className="btn btn-outline btn-primary">
            {t('uploadFile')}
            <input
              type="file"
              accept=".jsonl"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {fileMetadata && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{t('fileMD5')}: {fileMetadata.md5}</span> | <span>{t('lineCount')}: {fileMetadata.lineCount}</span>
            </div>
          )}
        </div>

        {/* 导出按钮 */}
        <ExportDialog fileMetadata={fileMetadata} clearAnnotations={clearAllAnnotations}/>
      </div>

      {/* 内容展示区域 - 三栏布局：左侧(文本) - 中间(标注功能) - 右侧(标注结果) */}
      <div className="flex flex-1 overflow-hidden text-base-content">
        {/* 左侧：文本显示和选择区域 */}
        <div className="w-1/3 p-8 border-r border-base-300 bg-base-100 flex flex-col">
          {/* 行导航按钮 */}
          <div className="flex gap-2 mb-4 items-center">
            <button
              onClick={handlePrevLine}
              disabled={currentLine === 0}
              className="btn btn-primary"
            >
              {t('prevLine')}
            </button>

            <div className="flex items-center px-4 py-2 font-mono bg-base-200 rounded">
              <span className="">{ fileMetadata ? currentLine + 1 : '--'}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="">{fileMetadata?.lineCount || '--'}</span>
            </div>

            <button
              onClick={handleNextLine}
              disabled={!fileMetadata || currentLine >= fileMetadata.lineCount - 1}
              className="btn btn-primary"
            >
              {t('nextLine')}
            </button>

            <div className="join">
              <div>
                <label className="input validator join-item">
                  <input ref={ toPageRef } disabled={!fileMetadata} placeholder={ t('inputLine') } type="number" min={1} max={fileMetadata ? currentLine + 1 : 1}/>
                </label>
              </div>
              <button className="btn btn-neutral join-item" onClick={ handleToPage }>{ t('toPage') }</button>
            </div>

          </div>

          <textarea
            ref={textareaRef}
            className="textarea textarea-accent flex-1 w-full p-4 text-lg resize-none"
            placeholder={jsonlData.length === 0 ? t('placeholder') : t('currentLineTextHere')}
            value={currentText}
            readOnly={true}
            onSelect={handleTextSelect}
            onMouseUp={handleMouseUp}
          />
        </div>

        {/* 中间：标注功能区域 */}
        <div className="w-1/3 p-8 border-r border-base-300 bg-base-100 flex flex-col">
          {/* 共享数据信息 */}
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {fileMetadata && (
              <div className="card card-compact bg-base-200 p-3 rounded mb-2">
                <div className="card-body p-0">
                  <div>{t('fileMD5')}: {fileMetadata.md5}</div>
                  <div>{t('currentLineNumber')}: {currentLine + 1}</div>
                  <div>{t('currentText')}: {currentText.length > 50 ? currentText.substring(0, 50) + "..." : currentText}</div>
                </div>
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4 text-base-content">{t('selectedTextTitle')}:</h2>

          {/* 选中文本展示 */}
          <div className="card bg-base-200 shadow-sm mb-6 p-4 min-h-[200px]">
            {selectedText ? (
              <p className="break-all text-base-content">{selectedText}</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500">{t('noTextSelected')}</p>
            )}
          </div>

          {/* 标注功能区 */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-3 text-base-content">{t('annotationTitle')}</h3>

            {/* 新增label输入 */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('newLabelPlaceholder')}
                value={newLabelInput}
                onChange={handleNewLabelInputChange}
                className="input input-bordered flex-1"
              />

              <button
                onClick={saveAnnotation}
                disabled={!selectedText}
                className="btn btn-success"
              >
                {t('saveAnnotation')}
              </button>
            </div>

            {/* 已有label选择 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from(labels).map((label) => (
                <div
                  key={label}
                  onClick={() => handleLabelSelect(label)}
                  className={`badge badge-sm badge-dash ${
                    selectedLabel === label
                      ? "btn-primary"
                      : "btn-accent"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：标注结果展示区域 */}
        <div className="w-1/3 p-8 bg-base-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-base-content">{t('annotationResults')}</h2>
          <div className="flex-1 card bg-base-200 shadow-sm p-4 overflow-auto">
            {annotations[currentLine] ? (
              // 只显示当前行的标注结果
              <pre className="whitespace-pre-wrap font-mono text-sm text-base-content">{JSON.stringify({ [currentLine]: annotations[currentLine] }, null, 2)}</pre>
            ) : (
              <p className="text-gray-400 dark:text-gray-500">{t('noAnnotations')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}