"use client";
import { useState, useEffect, useRef } from "react";
import SparkMD5 from "spark-md5";

// 文件元数据类
class FileMetadata {
  private _md5: string;
  private _lineCount: number;

  constructor(md5: string, lineCount: number) {
    this._md5 = md5;
    this._lineCount = lineCount;
  }

  get md5(): string {
    return this._md5;
  }

  get lineCount(): number {
    return this._lineCount;
  }
}

// 导入存储服务
import { IStorageService } from '../services/storage';
import { StorageFactory } from '../services/storage-factory';

// 导入navbar组件
import Navbar from './layouts/Navbar';

// 合并后的文本标注组件
export default function TextAnnotation() {
  // 使用工厂模式创建存储服务实例 - 后续可通过环境变量轻松替换为其他实现
  const storageService: IStorageService = StorageFactory.createStorage();
  // 文件上传相关
  const [jsonlData, setJsonlData] = useState<{ text: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [currentText, setCurrentText] = useState("");

  // 文本选择相关
  const [selectedText, setSelectedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
        const key = `${fileMetadata.md5}_line_${currentLine}`;
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
      alert("请上传jsonl格式的文件");
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
      alert("请先选择要标注的文本");
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
      alert("请选择或输入一个label");
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
      const key = `${fileMetadata.md5}_line_${currentLine}`;

      storageService.put(key, currentAnnotation)
        .catch(error => console.error("Failed to save annotation to storage:", error));
    }

    // 重置状态
    setSelectedText("");
    setSelectedLabel(null);
    setNewLabelInput("");
  };

  // 导出标注结果
  const exportAnnotations = async () => {
    if (!fileMetadata) {
      alert("请先上传文件");
      return;
    }

    // 检查存储中是否有相关数据
    const keys = await storageService.getAllKeys();
    const relevantKeys = keys.filter(key => key.startsWith(`${fileMetadata.md5}_`));

    if (relevantKeys.length === 0 && Object.keys(annotations).length === 0) {
      alert("没有可导出的标注结果");
      return;
    }

    // 弹出确认对话框
    const confirmExport = window.confirm("当前操作会重置所有已记录的标注结果，确定要继续吗？");
    if (!confirmExport) {
      return;
    }

    // 从存储中获取所有当前文件的标注结果，而不是仅本地状态
    const getFullAnnotations = async () => {
      try {
        // 使用新的getWithPrefix方法获取所有相关数据
        const prefix = `${fileMetadata.md5}_`;
        const annotationsFromStorage = await storageService.getWithPrefix(prefix);

        // 提取values并过滤掉null值
        const validAnnotations = Object.values(annotationsFromStorage)
          .filter(annotation => annotation !== null);

        return validAnnotations;
      } catch (error) {
        console.error("Failed to get all annotations from storage:", error);
        // 失败时回退到本地状态
        return Object.values(annotations).filter(annotation => annotation !== null);
      }
    };

    // 执行导出
    const annotationsToExport = await getFullAnnotations();

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
        setAnnotations({});
      } catch (error) {
        console.error("Failed to clear annotations from storage:", error);
      }
    };

    clearStorage();
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-base-100">
      {/* Navbar */}
      <Navbar />

      {/* 文件上传区域 */}
      <div className="p-4 border-b border-base-300 bg-base-100 flex flex-wrap gap-4 items-center justify-between overflow-hidden">
        <div>
          <label className="btn btn-outline btn-primary">
            上传JSONL文件
            <input
              type="file"
              accept=".jsonl"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {fileMetadata && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>文件MD5: {fileMetadata.md5}</span> | <span>行数: {fileMetadata.lineCount}</span>
            </div>
          )}
        </div>

        {/* 导出按钮 */}
        <button
          onClick={exportAnnotations}
          disabled={!fileMetadata || Object.keys(annotations).length === 0}
          className="btn btn-accent"
        >
          导出标注结果
        </button>
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
              ← 上一行
            </button>

            <div className="flex items-center px-4 py-2 font-mono bg-base-200 rounded">
              <span className="">行 {currentLine + 1}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="">{fileMetadata?.lineCount || 0}</span>
            </div>

            <button
              onClick={handleNextLine}
              disabled={!fileMetadata || currentLine >= fileMetadata.lineCount - 1}
              className="btn btn-primary"
            >
              下一行 →
            </button>
          </div>

          <textarea
            ref={textareaRef}
            className="textarea textarea-accent flex-1 w-full p-4 text-lg resize-none"
            placeholder={jsonlData.length === 0 ? "请先上传jsonl文件..." : "当前行的文本将显示在这里..."}
            value={currentText}
            readOnly={jsonlData.length > 0} // 上传文件后只读
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
                  <div>文件 MD5: {fileMetadata.md5}</div>
                  <div>当前行号: {currentLine + 1}</div>
                  <div>当前文本: {currentText.length > 50 ? currentText.substring(0, 50) + "..." : currentText}</div>
                </div>
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4 text-base-content">Selected Text:</h2>

          {/* 选中文本展示 */}
          <div className="card bg-base-200 shadow-sm mb-6 p-4 min-h-[200px]">
            {selectedText ? (
              <p className="break-all text-base-content">{selectedText}</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500">No text selected yet</p>
            )}
          </div>

          {/* 标注功能区 */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-3 text-base-content">标注</h3>

            {/* 新增label输入 */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入新的label"
                value={newLabelInput}
                onChange={handleNewLabelInputChange}
                className="input input-bordered flex-1"
              />

              <button
                onClick={saveAnnotation}
                disabled={!selectedText}
                className="btn btn-success"
              >
                确定标注
              </button>
            </div>

            {/* 已有label选择 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from(labels).map((label) => (
                <button
                  key={label}
                  onClick={() => handleLabelSelect(label)}
                  className={`btn btn-sm ${
                    selectedLabel === label
                      ? "btn-primary"
                      : "btn-ghost"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：标注结果展示区域 */}
        <div className="w-1/3 p-8 bg-base-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-base-content">标注结果</h2>
          <div className="flex-1 card bg-base-200 shadow-sm p-4 overflow-auto">
            {annotations[currentLine] ? (
              // 只显示当前行的标注结果
              <pre className="whitespace-pre-wrap font-mono text-sm text-base-content">{JSON.stringify({ [currentLine]: annotations[currentLine] }, null, 2)}</pre>
            ) : (
              <p className="text-gray-400 dark:text-gray-500">暂无标注</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}