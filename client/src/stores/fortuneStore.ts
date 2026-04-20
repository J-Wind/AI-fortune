import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FortuneData {
  thought: string; // 心中所念
  mood: string; // 当前心境
  seasonFeel: string; // 时节感受
  triggerWord: string; // 随机触发词
}

export interface FortuneResult {
  number: string; // 签号
  mainText: string; // 主签文
  culturalReference: string; // 文化意象引用
  hexagram: string; // 易经卦象
  userInput: FortuneData; // 用户输入信息
  imageUrl?: string; // 生成的配套图片URL
}

export interface InterpretationResult {
  seasonEcho: string; // 时节呼应
  hexagramWisdom: string; // 卦象智慧
  specificGuide: string; // 具体指引
  actionAdvice: string; // 行动建议
}

interface FortuneStore {
  formData: FortuneData;
  fortuneResult: FortuneResult | null;
  interpretationResult: InterpretationResult | null;
  fortuneImage: string | null; // AI生成的图片URL
  setFormData: (data: Partial<FortuneData>) => void;
  setFortuneResult: (result: FortuneResult) => void;
  setInterpretationResult: (result: InterpretationResult) => void;
  setFortuneImage: (imageUrl: string | null) => void;
  resetFormData: () => void;
  resetFortuneResult: () => void;
  resetInterpretationResult: () => void;
  resetFortuneImage: () => void;
}

const initialFormData: FortuneData = {
  thought: '',
  mood: '',
  seasonFeel: '',
  triggerWord: '',
};

export const useFortuneStore = create<FortuneStore>()(
  persist(
    (set) => ({
      formData: initialFormData,
      fortuneResult: null,
      interpretationResult: null,
      fortuneImage: null,
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      setFortuneResult: (result) =>
        set({ fortuneResult: result }),
      setInterpretationResult: (result) =>
        set({ interpretationResult: result }),
      setFortuneImage: (imageUrl) =>
        set({ fortuneImage: imageUrl }),
      resetFormData: () => set({ formData: initialFormData }),
      resetFortuneResult: () => set({ fortuneResult: null }),
      resetInterpretationResult: () => set({ interpretationResult: null }),
      resetFortuneImage: () => set({ fortuneImage: null }),
    }),
    {
      name: 'fortune-storage',
    }
  )
);