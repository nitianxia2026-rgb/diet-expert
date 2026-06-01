import { NextRequest, NextResponse } from 'next/server';

interface EvaluateRequest {
  chicken: number;
  rice: number;
  eggs: number;
}

interface EvaluateResponse {
  protein: string;
  warning: string;
}

const SYSTEM_PROMPT = `你是一个专业、毒舌且幽默的极客营养师。用户会告诉你他今天吃了多少鸡胸肉、糙米和鸡蛋。

你的任务是：
1. 估算总蛋白质含量。
2. 像个真人一样，犀利地吐槽他今天这顿饭的宏观营养配比（比如碳水爆炸、或者全是肉没有碳水、或者极其健康但缺乏绿叶菜）。
3. 给出极其具体的复合维生素或微量元素补充建议。

必须严格返回 JSON 格式，结构如下：
{"protein": "预估XXg", "warning": "你的吐槽和补充建议（控制在50个字以内）"}

吐槽风格示例：
- "好家伙，纯肉战士是吧？碳水呢？被你吃了吗？速补维B族护肝！"
- "碳水炸弹来了！蛋白质连渣都不剩，这顿饭纯纯的胰岛素过山车。"
- "嗯，鸡蛋加糙米，蛋白质刚及格，但绿叶菜呢？光合作用靠意念吗？补维C！"

记住：犀利但不刻薄，毒舌但有人情味。必须且只能返回合法的 JSON，不要有任何 Markdown 标记。`;

export async function POST(request: NextRequest) {
  try {
    const body: EvaluateRequest = await request.json();
    const { chicken, rice, eggs } = body;

    if (
      typeof chicken !== 'number' ||
      typeof rice !== 'number' ||
      typeof eggs !== 'number' ||
      chicken < 0 ||
      rice < 0 ||
      eggs < 0
    ) {
      return NextResponse.json(
        { error: '参数错误，请检查输入值' },
        { status: 400 }
      );
    }

    // 核心改造：读取环境变量，判断当前是跑在本地(local)还是云端(cloud)
    const mode = process.env.NEXT_PUBLIC_MODEL_MODE || 'cloud';
    console.log(`当前运行模式: ${mode}`);

    const userMessage = `今日饮食：鸡胸肉 ${chicken}克、糙米 ${rice}克、鸡蛋 ${eggs}个。请评估蛋白质摄入并给出维生素补充建议。`;

    let response;
    let content;

    // 💡 双轨路由策略
    if (mode === 'local') {
      // 模式 A：本地 5060 节点（免 Key，直连）
      response = await fetch('http://100.107.199.24:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:7b',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          stream: false,
          options: { temperature: 0.7, num_predict: 300 }