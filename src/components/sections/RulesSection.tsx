import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameStore } from "@/lib/game/store";

const FLOW_NORMAL = [
  "1 层任务 ×1（A）",
  "2 层任务 ×1（A）",
  "2→4 上楼",
  "4 层任务 ×1（B）",
  "5 层任务 ×1（B）",
  "5→7 上楼",
  "7 层任务 ×1（C）",
  "8 层任务 ×2（C）",
  "8→10 上楼",
  "结算",
];

const FLOW_HELL = [
  "普通流程至 8 层",
  "8→9 上楼（电梯厅外围）",
  "9 层地狱任务 ×1",
  "9→10 → 上楼至 11",
  "11 层地狱任务 ×1",
  "完成后结算",
];

const ENDINGS_NORMAL = [
  { range: "≥40", text: "怎么射、在哪射都随你，也可以不射，完成后回家" },
  { range: "30–39", text: "射到短袜上，含住至少10s，完成后回家" },
  { range: "20–29", text: "全裸跪下射出来，用身体或舌头舔干净，完成后回家" },
  { range: "10–19", text: "射到身上多处，拍下来，舔干净，完成后回家" },
  { range: "1–9", text: "不准射，裸体罚跪至少15分钟，戴贞操锁3天，短袜塞嘴里回家" },
  { range: "0", text: "当场再抽一项C级任务做完，再按1–9分结局执行" },
];

const ENDINGS_NORMAL_FEMALE = [
  { range: "≥40", text: "怎么高潮、在哪高潮都随你，也可以不准自己高潮，完成后回家" },
  { range: "30–39", text: "高潮到短袜上，含住至少10s，完成后回家" },
  { range: "20–29", text: "全裸跪下高潮出来，用身体或舌头舔干净，完成后回家" },
  { range: "10–19", text: "高潮到身上多处，拍下来，舔干净，完成后回家" },
  { range: "1–9", text: "不准高潮，裸体罚跪至少15分钟，内裤勒进逼缝走回家，短袜塞嘴里" },
  { range: "0", text: "当场再抽一项C级任务做完，再按1–9分结局执行" },
];

const ENDINGS_HELL = [
  { range: "≥60", text: "电梯厅不用再做任何事，马上回家，拿到「地狱幸存者」" },
  { range: "45–59", text: "电梯厅正中央全裸边缘至少两次，完成后才能射，再回家" },
  { range: "30–44", text: "电梯厅先完整尿出来，立刻边缘一次，再射出来，完成后回家" },
  { range: "15–29", text: "电梯厅全裸罚跪至少5分钟，拍下来，完成后回家" },
  { range: "0–14", text: "电梯厅全裸，尿出来，不准射，戴贞操锁7天，短袜塞嘴里回家" },
];

const ENDINGS_HELL_FEMALE = [
  { range: "≥60", text: "电梯厅不用再做任何事，马上回家，拿到「地狱幸存者」" },
  { range: "45–59", text: "电梯厅正中央全裸边缘至少两次，完成后才能高潮，再回家" },
  { range: "30–44", text: "电梯厅先完整尿出来，立刻边缘一次，再高潮出来，完成后回家" },
  { range: "15–29", text: "电梯厅全裸罚跪至少5分钟，拍下来，完成后回家" },
  { range: "0–14", text: "电梯厅全裸，尿出来，不准高潮，内裤塞进逼里走回家，短袜塞嘴里" },
];

export function RulesSection() {
  const setView = useGameStore((s) => s.setView);
  const phase = useGameStore((s) => s.state.gamePhase);
  const goBack = () => {
    if (phase === "shop") setView("shop");
    else if (phase === "adventure") setView("game");
    else setView("start");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">规则</h1>
        <p className="mt-1 text-sm text-muted-foreground">完整流程与计分说明</p>
      </div>

      <Card className="py-0">
        <CardContent className="p-4 sm:p-5">
          <Tabs defaultValue="flow">
            <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <TabsTrigger value="flow">流程</TabsTrigger>
              <TabsTrigger value="score">积分</TabsTrigger>
              <TabsTrigger value="shop">商店</TabsTrigger>
              <TabsTrigger value="task">得分</TabsTrigger>
              <TabsTrigger value="ending">结局</TabsTrigger>
              <TabsTrigger value="hell">地狱</TabsTrigger>
            </TabsList>

            <TabsContent value="flow" className="mt-5 space-y-4">
              <SectionTitle>普通流程（10 步）</SectionTitle>
              <p className="text-sm leading-relaxed text-muted-foreground">
                开局选公狗或母狗、普通或地狱。母狗模式任务按女生改写（逼、揉、高潮），并含掰穴、勒缝、奶子贴墙等。流程与计分相同。
              </p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {FLOW_NORMAL.map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm">
                    <span className="grid size-6 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="score" className="mt-5 space-y-3">
              <SectionTitle>积分</SectionTitle>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>· 初始 0–22 分（语义 5–27，5 分预留给长裤）</li>
                <li>· 地狱模式开局额外 -3 分</li>
                <li>· 商店可重新随机积分，最多 2 次；重随后已购商品退回</li>
                <li>· 长裤必购 5 分</li>
                <li>· 完成任务：基础分 + 暴露加成 + 尿液加成（如有）</li>
              </ul>
              <p className="rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                关键衣物 = 上衣 / 长裤 / 内裤 / 短袜。每少穿一件 +1；地狱额外 +1；风险加倍券使暴露加成 ×1.5。
              </p>
            </TabsContent>

            <TabsContent value="shop" className="mt-5 space-y-3">
              <SectionTitle>商店</SectionTitle>
              <p className="text-sm text-muted-foreground">
                上衣、长裤、内裤、短袜默认都有。护膝在首页勾选。商店买的是出门穿着；没买的请放包里。准备出门时会给出携带清单。退货仅限商店阶段。
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">衣物</p>
                  <p className="mt-1 text-muted-foreground">
                    长裤 5 · 上衣 4 · 内裤 4 · 短袜 2 · 护膝 2
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">道具</p>
                  <p className="mt-1 text-muted-foreground">
                    跳过 6 · 恢复内裤 8 · 延迟剥夺衣物 5 · 风险加倍 6
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="task" className="mt-5 space-y-3">
              <SectionTitle>得分与剥夺衣物</SectionTitle>
              <p className="text-sm text-muted-foreground">
                基础分 + 暴露 + 尿液加成。普通 50%（骰≤3）触发脱衣；地狱 / 风险加倍约 66%（骰≤4）。可用 5
                分保留（电梯厅 8 分），或用延迟剥夺衣物券推迟到下一层。护膝不参与剥夺。无衣可脱时 -5 分并强制尿液标记。
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                <span className="rounded border px-2 py-2">4件 +0</span>
                <span className="rounded border px-2 py-2">3件 +1</span>
                <span className="rounded border px-2 py-2">2件 +2</span>
                <span className="rounded border bg-foreground px-2 py-2 text-background">0–1件 +3–4</span>
              </div>
            </TabsContent>

            <TabsContent value="ending" className="mt-5 space-y-4">
              <SectionTitle>普通结局 · 公狗</SectionTitle>
              <EndingTable rows={ENDINGS_NORMAL} />
              <SectionTitle>普通结局 · 母狗</SectionTitle>
              <EndingTable rows={ENDINGS_NORMAL_FEMALE} />
            </TabsContent>

            <TabsContent value="hell" className="mt-5 space-y-4">
              <SectionTitle>地狱模式（12 步）</SectionTitle>
              <p className="text-sm text-muted-foreground">
                开局选择地狱（初始 -3）。剥夺衣物概率升高，暴露加成 +1，电梯厅保留衣物 8 分。想改模式请回主页重选。
              </p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {FLOW_HELL.map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm">
                    <span className="grid size-6 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <SectionTitle>地狱结局 · 公狗</SectionTitle>
              <EndingTable rows={ENDINGS_HELL} />
              <SectionTitle>地狱结局 · 母狗</SectionTitle>
              <EndingTable rows={ENDINGS_HELL_FEMALE} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={goBack} className="min-w-24">
          返回
        </Button>
      </div>
    </div>
  );
}

function EndingTable({ rows }: { rows: { range: string; text: string }[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">得分</TableHead>
            <TableHead>处置</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e) => (
            <TableRow key={e.range}>
              <TableCell className="font-mono text-sm font-medium tabular-nums">{e.range}</TableCell>
              <TableCell className="text-sm">{e.text}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="border-l-2 border-foreground pl-3 text-sm font-semibold">{children}</h3>;
}
