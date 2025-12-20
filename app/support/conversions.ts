interface TextLabelInput {
  text: string;
  label: {
    [entityType: string]: {
      [entityText: string]: [number, number][];
    };
  };
}

interface BIOOutput {
  tokens: string[];
  labels: string[];
}

const jsonSample = {"text": "浙商银行企业信贷部叶老桂博士则从另一个角度对五道门槛进行了解读。叶老桂认为，对目前国内商业银行而言，", "label": {"name": {"叶老桂": [[9, 11],[32, 34]]}, "company": {"浙商银行": [[0, 3]]}}}
const bioSample = {"tokens": ["浙", "商", "银", "行", "企", "业", "信", "贷", "部", "叶", "老", "桂", "博", "士", "则", "从", "另", "一", "个", "角", "度", "对", "五", "道", "门", "槛", "进", "行", "了", "解", "读", "。", "叶", "老", "桂", "认", "为", "，", "对", "目", "前", "国", "内", "商", "业", "银", "行", "而", "言", "，"], "labels": ["B-company", "I-company", "I-company", "I-company", "O", "O", "O", "O", "O", "B-name", "I-name", "I-name", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "B-name", "I-name", "I-name", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"]}
  

const convertSampleByJson = (input: string): BIOOutput => {
  const sample: TextLabelInput = JSON.parse(input);
  return convertSample(sample);
}

/**
 * 单条样本转换
 */
const convertSample = (sample: TextLabelInput): BIOOutput => {
  const tokens = Array.from(sample.text);
  const labels = new Array(tokens.length).fill("O");

  for (const entityType of Object.keys(sample.label)) {
    const entities = sample.label[entityType];

    for (const entityText of Object.keys(entities)) {
      const spans = entities[entityText];

      for (const [start, end] of spans) {
        if (start < 0 || end >= tokens.length) {
          console.warn(`⚠️ 跳过非法区间: ${start}-${end}`);
          continue;
        }

        labels[start] = `B-${entityType}`;
        for (let i = start + 1; i <= end; i++) {
          labels[i] = `I-${entityType}`;
        }
      }
    }
  }

  return { tokens, labels };
}

export { jsonSample, bioSample, convertSample, convertSampleByJson };