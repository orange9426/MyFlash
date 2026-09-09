import type {
  ClothingItem,
  EndingDef,
  GameMode,
  GameState,
  OwnedInventory,
  OwnedItemId,
  Persona,
  ShopItem,
  Task,
} from "./types";
import {
  endingsHellFemale,
  endingsNormalFemale,
  tasksFemale,
} from "./tasksFemale";

export { tasksFemale, endingsNormalFemale, endingsHellFemale };

export const DEFAULT_OWNED_INVENTORY: OwnedInventory = {
  上衣: true,
  长裤: true,
  内裤: true,
  短袜: true,
  护膝: false,
};

/** 默认都有；护膝在首页单独勾选。 */
export const REQUIRED_OWNED_ITEMS: OwnedItemId[] = ["上衣", "长裤", "内裤", "短袜"];

export function createDefaultOwnedInventory(
  override?: Partial<OwnedInventory>,
): OwnedInventory {
  const forced = Object.fromEntries(REQUIRED_OWNED_ITEMS.map((id) => [id, true]));
  return { ...DEFAULT_OWNED_INVENTORY, ...override, ...forced };
}

export const TOTAL_FLOORS_NORMAL = 10;
export const TOTAL_FLOORS_HELL = 11;
/** @deprecated 使用 getTotalFloors(mode) */
export const TOTAL_FLOORS_FOR_PROGRESS = TOTAL_FLOORS_NORMAL;
export const TOTAL_PROGRESS_STEPS_NORMAL = 10;
export const TOTAL_PROGRESS_STEPS_HELL = 12;
/** @deprecated 使用 getTotalProgressSteps(mode) */
export const TOTAL_PROGRESS_STEPS = TOTAL_PROGRESS_STEPS_NORMAL;

/** 无跳过券时，花费积分跳过当前任务的消耗 */
export const SKIP_TASK_COST = 6;

/** 商店阶段允许重新随机积分的次数 */
export const MAX_SCORE_REROLLS = 2;

export const CLOTHING_ITEMS: ClothingItem[] = [
  "上衣",
  "长裤",
  "内裤",
  "短袜",
  "护膝",
];

export function sanitizeClothing(
  clothing: Partial<Record<string, boolean>> | null | undefined,
): Record<ClothingItem, boolean> {
  return Object.fromEntries(
    CLOTHING_ITEMS.map((key) => [key, !!clothing?.[key]]),
  ) as Record<ClothingItem, boolean>;
}

/** 计入暴露加成的关键衣物（护膝不计） */
export const KEY_CLOTHING_ITEMS: ClothingItem[] = [
  "上衣",
  "长裤",
  "内裤",
  "短袜",
];

/** 可被剥夺的衣物（护膝只是跪爬防护，不参与剥夺） */
export const STRIPPABLE_CLOTHING_ITEMS: ClothingItem[] = [
  "上衣",
  "长裤",
  "内裤",
  "短袜",
];

export const TASK_FLOORS_NORMAL = [1, 2, 4, 5, 7, 8] as const;
export const TASK_FLOORS_HELL = [1, 2, 4, 5, 7, 8, 9, 11] as const;
export const HELL_TASK_FLOORS = [9, 11] as const;
export const TASK_FLOORS = TASK_FLOORS_NORMAL;

export const CLIMBING_DECISION_FLOORS_NORMAL = [2, 5, 8] as const;
export const CLIMBING_DECISION_FLOORS_HELL = [2, 5, 8, 10] as const;
export const CLIMBING_DECISION_FLOORS = CLIMBING_DECISION_FLOORS_NORMAL;

export const NEXT_FLOOR_MAP_NORMAL: Record<number, number> = {
  1: 2,
  4: 5,
  7: 8,
};
export const NEXT_FLOOR_MAP_HELL: Record<number, number> = {
  1: 2,
  4: 5,
  7: 8,
  9: 10,
};
export const NEXT_FLOOR_MAP = NEXT_FLOOR_MAP_NORMAL;

export const CLIMBING_TARGET_MAP_NORMAL: Record<number, number> = {
  2: 4,
  5: 7,
  8: 10,
};
/** 地狱：8 上楼后进入 9（电梯厅外围），再经 10 决策爬至 11（核心），11 完成后结算 */
export const CLIMBING_TARGET_MAP_HELL: Record<number, number> = {
  2: 4,
  5: 7,
  8: 9,
  10: 11,
};
export const CLIMBING_TARGET_MAP = CLIMBING_TARGET_MAP_NORMAL;

export function getTotalFloors(mode: GameMode): number {
  return mode === "hell" ? TOTAL_FLOORS_HELL : TOTAL_FLOORS_NORMAL;
}

export function getTotalProgressSteps(mode: GameMode): number {
  return mode === "hell" ? TOTAL_PROGRESS_STEPS_HELL : TOTAL_PROGRESS_STEPS_NORMAL;
}

export function getTaskFloors(mode: GameMode): readonly number[] {
  return mode === "hell" ? TASK_FLOORS_HELL : TASK_FLOORS_NORMAL;
}

export function getClimbingDecisionFloors(mode: GameMode): readonly number[] {
  return mode === "hell"
    ? CLIMBING_DECISION_FLOORS_HELL
    : CLIMBING_DECISION_FLOORS_NORMAL;
}

export function getNextFloorMap(mode: GameMode): Record<number, number> {
  return mode === "hell" ? NEXT_FLOOR_MAP_HELL : NEXT_FLOOR_MAP_NORMAL;
}

export function getClimbingTargetMap(mode: GameMode): Record<number, number> {
  return mode === "hell" ? CLIMBING_TARGET_MAP_HELL : CLIMBING_TARGET_MAP_NORMAL;
}

function t(
  id: string,
  name: string,
  description: string,
  baseScore: number,
  urineBonus?: number,
): Task {
  return urineBonus !== undefined
    ? { id, name, description, baseScore, urineBonus }
    : { id, name, description, baseScore };
}

export const tasks: Record<string, Task[]> = {
  A: [
    t("A1", "舔脏袜", "穿短袜原地走3圈，舔袜面或袜趾，含进嘴里1次，完成后袜子不能擦", 2),
    t("A2", "揉鸡巴", "跪下，掏出鸡巴揉", 2),
    t("A3", "狗叼内裤", "内裤脱下后叼进嘴里，含住至少10s", 1),
    t("A4", "短袜自慰", "短袜套在鸡巴上，撸至少30s，不准射", 2),
    t("A5", "乳头刺激", "上衣卷起，两乳头紧贴冷墙至少1分钟，不能出声", 1),
    t("A6", "狗姿被操", "狗姿抵墙，模拟被操至少10下，边做边娇喘", 2),
    t("A7", "墙角磨裆", "面对墙角，下体紧贴墙面前后摩擦至少30下，边蹭边轻喘", 2),
    t("A8", "短袜套头", "把脱下的短袜套在鸡巴头上，保持至少1分钟，期间不能碰", 2),
    t("A9", "跪地数台阶", "跪下从当前层走到下一层，每级台阶用舌头轻舔一次", 2),
    t("A11", "冷风吹鸡巴", "打开楼道窗（若有）或对着通风口，鸡巴完全露在风里至少2分钟", 2),
    t("A12", "镜面摩擦", "鸡巴头在防火门上轻轻蹭，蹭出至少3条水痕", 2),
    t("A13", "轻度憋尿展示", "憋到有感觉，楼梯转角掏出鸡巴，用尿在地面画一个小圈", 2, 1),
    t("A14", "尿湿短袜", "脱下一只短袜，用少量尿湿透，再穿上，走完本层", 2, 1),
    t("A15", "尿痕标记", "鸡巴头蘸尿，在墙上点三个点，摆成三角", 2, 1),
    t("A16", "跪尿", "跪下把鸡巴压在台阶上，慢慢尿出一小段，用舌头把台阶舔干净", 3, 2),
    t("A17", "娇喘阶梯", "每上一级台阶娇喘一声，连续至少10级", 2),
    t("A18", "狗叫爬行", "四肢着地爬至少5米，每爬一步短促狗叫一声", 2),
    t("A19", "沉默忍耐", "自己轻轻捏住乳头或鸡巴，完全不出声至少1分钟", 1),
    t("A20", "边缘低语", "边撸边对着墙缝低声说「我是暴露的狗」，至少重复10次", 2),
    t("A21", "临时口塞", "内裤塞进嘴里，含住至少30s，期间继续走路", 2),
    t("A22", "短袜绑手腕", "用短袜把双手轻轻绑在背后，跪下保持至少1分钟", 2),
    t("A23", "护膝羞耻", "只穿护膝，其余全脱，转角狗姿保持至少30s", 3),
    t("A24", "衣物堆放", "把脱下的所有衣物整齐叠在台阶上，自己光着在旁边守至少1分钟", 3),
    t("A25", "低角度自拍", "跪下露鸡巴，从下往上拍至少3张", 2),
    t("A26", "影子展示", "借楼道灯光，摆出夸张勃起影子，拍下来", 2),
    t("A27", "倒计时暴露", "手机倒计时至少60s，期间下半身全裸站着", 2),
    t("A28", "声音录制", "录一段边撸边娇喘的音频，至少30s", 2),
    t("A29", "闻自己的味道", "把刚脱下的内裤或短袜捂在鼻子上深吸至少10次", 1),
    t("A30", "温度对比", "冰凉金属扶手贴住龟头，保持至少20s", 2),
    t("A31", "缓慢脱衣表演", "楼梯中间用最慢速度把内裤脱到脚踝，再提起来，至少重复3次", 2),
    t("A32", "最后一滴", "鸡巴上残留的前列腺液，用手指抹到嘴唇上，完成后才算过", 2),
  ],
  B: [
    t("B1", "舔地", "内裤垫地，跪着舔1级台阶，舔完再跪至少5s", 3),
    t("B2", "模拟做爱", "光屁股面对墙撸鸡巴，往墙上撞至少3下，模拟做爱", 3),
    t("B3", "勃起露出", "露出勃起带血管的鸡巴头，拍至少3张不同角度", 2),
    t("B4", "夹腿露出", "脱下内裤包住鸡巴，夹腿，保持至少1分钟", 2),
    t("B5", "全裸露出", "下半身全裸，长裤挂在脖子上，坚持至少2分钟", 3),
    t("B6", "狗姿摇屁股", "下半身全裸，狗姿摇屁股至少1分钟", 3),
    t("B7", "楼梯扶手摩擦", "鸡巴沿扶手来回滑至少20下，留下水痕", 3),
    t("B8", "转角全裸守候", "转角处下半身全裸，站立或跪姿，坚持至少3分钟", 3),
    t("B9", "双腿大开", "坐在台阶上双腿完全打开，鸡巴朝向可能有人下来的方向，保持至少2分钟", 3),
    t("B10", "屁股朝上", "狗姿把屁股抬得比头高，保持至少1分半，期间可以轻轻摇", 3),
    t("B11", "台阶排尿", "选一级台阶，鸡巴对准台阶边缘慢慢尿，至少尿湿半级", 3, 2),
    t("B12", "尿后舔净", "尿完用舌头把台阶上的尿舔到肉眼看不见", 4, 2),
    t("B13", "尿湿内裤再穿", "把内裤脱下，用尿浸湿，再穿上，继续做后面的动作", 3, 2),
    t("B14", "标记转角", "转角墙壁用尿写一个简单符号（如「狗」）", 3, 2),
    t("B16", "多角度视频", "录自己下半身全裸从狗姿到站立的完整过程，至少45s", 3),
    t("B17", "倒计时挑战", "倒计时至少2分钟，期间完成「脱内裤→撸20下→再穿上」循环至少3次", 3),
    t("B19", "影子实体", "影子和实体暴露各拍至少2张", 2),
    t("B20", "轻打鸡巴", "手掌轻轻拍打鸡巴两侧各至少10下，要拍出声音", 2),
    t("B21", "夹紧忍耐", "双腿把鸡巴紧紧夹住至少1分钟，期间不能用手碰", 2),
    t("B22", "乳头拉扯", "用力拉扯两边乳头，同时保持勃起至少30s", 2),
    t("B23", "短袜堵嘴", "两只短袜塞进嘴里，狗姿保持至少1分钟", 2),
    t("B24", "护膝跪行", "只穿护膝，膝盖着地缓慢移动至少3米", 3),
    t("B25", "防火门摩擦", "鸡巴在防火门上缓慢画圈，至少5圈", 2),
    t("B26", "通风口暴露", "鸡巴伸向通风口，气流直接吹龟头至少2分钟", 2),
    t("B27", "听筒羞耻", "手机开免提放身边，假装有人在通话，自己继续暴露", 3),
    t("B29", "寸止一次", "撸到即将高潮时强制停下，冷静至少30s再继续", 3),
    t("B30", "前列腺液收集", "流出的前列腺液全部用手指收集，抹在胸口", 2),
    t("B31", "边缘低语升级", "边边缘边大声说「请路过的主人看狗鸡巴」，至少重复8次", 3),
    t("B32", "双任务连续", "先狗姿摇屁股一次，紧接着立刻做一次夹腿露出", 3),
    t("B34", "温度刺激", "楼道里较凉的金属，交替刺激龟头与乳头", 2),
    t("B35", "缓慢全脱", "用超过2分钟，一件件把所有衣物脱下并整齐放好", 3),
    t("B36", "最终展示", "下半身全裸站在楼梯中间至少10s，完成后才可穿回", 3),
  ],
  C: [
    t("C1", "狗姿拍摄", "下半身全裸，狗姿掰开屁股，保持至少1分钟并拍照", 3),
    t("C2", "鸡巴贴地走", "穿短袜，鸡巴贴地蹲着走，屁股大幅扭动至少3米", 3),
    t("C3", "超长跪姿暴露", "鸡巴朝楼下，跪下至少10分钟，鸡巴头露着不能挡", 4),
    t("C4", "寸止挑战", "撸到高潮并寸止至少2次", 3),
    t("C5", "舔脚游戏", "舔脚趾和脚掌，舔完且舔干净", 4),
    t("C6", "阿努比斯摇", "全裸，跳阿努比斯摇，录下来", 3),
    t("C7", "全裸爬行", "完全赤裸（含短袜也可脱）四肢着地，爬完整层楼梯的一半距离", 4),
    t("C8", "长时间站立暴露", "下半身全裸站在楼梯最显眼处，坚持至少5分钟", 4),
    t("C9", "双层暴露", "上衣卷起，下半身全裸，保持至少3分钟", 3),
    t("C10", "转角守候升级", "转角全裸，鸡巴朝向可能来人的方向，坚持至少4分钟", 4),
    t("C11", "完整排尿展示", "楼梯中间站着，整泡尿全部尿在台阶上，过程录下来", 4, 3),
    t("C12", "尿后全身标记", "用自己的尿在胸口、大腿、鸡巴上各画一条线", 3, 2),
    t("C13", "尿湿全身", "故意让尿溅到小腿和脚上，然后继续裸着做后面的动作", 3, 2),
    t("C14", "舔尿台阶", "刚才尿过的台阶，用舌头清理到基本干净", 4, 3),
    t("C16", "多角度视频升级", "录完整「脱衣→暴露动作→排尿→再穿」全过程，至少90s", 4, 2),
    t("C17", "实时倒计时暴露", "倒计时至少5分钟，期间全裸，每隔30s换一个姿势", 4),
    t("C18", "声音最大化", "尽可能大声狗叫，持续至少1分钟", 3),
    t("C20", "轻打升级", "用手或衣物轻轻抽打鸡巴和屁股各至少15下", 3),
    t("C21", "强制边缘三次", "连续三次撸到高潮边缘再强制停下，每次间隔至少40s", 4),
    t("C22", "乳头折磨", "用力拧转乳头，同时狗姿保持至少1分半", 3),
    t("C23", "口塞暴露", "用内裤或短袜塞嘴，下半身全裸跪下至少3分钟", 3),
    t("C25", "整层标记", "本层至少三个不同位置留下尿液或前列腺液痕迹", 4, 3),
    t("C26", "扶手全摩擦", "鸡巴把整段扶手从头到尾摩擦一遍", 3),
    t("C27", "通风口长时间", "鸡巴长时间对着通风口，气流持续刺激至少3分钟", 3),
    t("C28", "听筒暴露", "手机开免提，假装通话，同时做完一次完整暴露动作", 3),
    t("C29", "强制寸止两次", "寸止两次，每次之后冷静满1分钟才能继续", 4),
    t("C30", "前列腺液大量收集", "尽可能多挤出前列腺液，全部涂在脸上或胸口", 3),
    t("C31", "边缘宣言", "边边缘边大声重复「我是楼道里的暴露公狗」至少15次", 3),
    t("C32", "连续高难度", "先做一次超长跪姿，紧接着立刻鸡巴贴地走", 4),
    t("C33", "衣物完全丢弃", "所有衣物丢到楼梯下方或转角，自己全裸做完任务再取回", 4),
    t("C34", "温度极端刺激", "最凉的金属和自己的体温，交替刺激敏感部位", 3),
    t("C35", "极慢脱衣仪式", "用超过4分钟一件件脱光，每脱一件摆一个姿势", 3),
    t("C36", "最终全裸巡视", "全裸在本层来回走一圈，至少来回一次，完成后才算过", 4),
    t("C38", "尿精边缘", "边缘状态下往鸡巴上滴几滴尿，然后继续边缘", 4, 2),
    t("C39", "狗姿持续摇", "狗姿保持的同时持续摇屁股至少3分钟", 3),
    t("C40", "终极展示", "全裸、勃起，面对可能来人的方向站着，坚持到自己主动停（最长5分钟）", 4),
  ],
  上楼任务: [
    t("U1", "狗姿上楼", "全程狗姿，仅穿短袜或全裸，往上爬2楼，脚不能着地", 2),
    t("U2", "跪姿上楼", "每上一级台阶膝盖至少落地1次，往上爬2楼", 2),
    t("U3", "露出上楼", "将内裤脱下叼在嘴里，同时下半身全裸，往上爬2楼", 3),
    t("U4", "披风上楼", "裤子挂在脖子上，全裸往上2楼。可自由选择爬or走。", 2),
    t("U5", "边缘上楼", "边撸鸡巴边缘，边爬2层", 3),
    t("U6", "赤脚上楼", "赤脚慢走，每一步停至少0.5s，露出鸡巴", 2),
    t("U7", "全裸爬楼", "完全赤裸四肢着地爬完两层", 3),
    t("U8", "尿迹上楼", "边爬边在每层台阶留下一点尿", 3, 2),
    t("U9", "口塞上楼", "嘴里塞着内裤或短袜，全裸或半裸爬两层", 3),
    t("U11", "边尿边上", "上楼过程中至少释放一次尿", 3, 2),
    t("U12", "倒计时上楼", "设置严格时间限制，超时则额外惩罚（随机脱衣）", 3),
    t("U14", "声音上楼", "每上一级发出明显狗叫", 2),
    t("U15", "摩擦上楼", "鸡巴持续与扶手或墙面保持接触", 3),
    t("U16", "临时全脱上楼", "上楼前把所有衣物丢在起始层，全裸爬完再取回", 3),
    t("U17", "多姿势切换", "上楼过程中至少切换3种姿势（狗、跪、蹲）", 3),
    t("U18", "边缘坚持上楼", "全程保持边缘，不准射", 3),
    t("U19", "标记上楼", "每层至少留下一处体液标记", 3, 2),
    t("U20", "缓慢惩罚上楼", "每一步停顿至少1s，全程用最慢速度", 2),
    t("U22", "短袜套头上楼", "短袜套在鸡巴上，完成整个上楼过程", 3),
    t("U23", "双层暴露上楼", "上衣卷起，下半身全裸，爬两层", 3),
    t("U28", "温度刺激上楼", "楼道金属持续刺激敏感部位", 2),
    t("U29", "最终冲刺", "最后半层用最快速度全裸冲", 3),
    t("U30", "完整仪式上楼", "上楼前先做一次短暴露，再开始爬", 3),
  ],
  H: [
    t("H1", "电梯厅门口站立暴露", "电梯厅门外下半身全裸站着至少2分钟，随时可能有人出现", 4),
    t("H2", "电梯按钮区边缘", "电梯按钮旁边边缘一次，鸡巴靠近按钮面板", 4),
    t("H3", "电梯厅中央跪姿", "电梯厅正中央跪下全裸，坚持至少3分钟", 5),
    t("H5", "电梯厅排尿", "电梯厅角落或垃圾桶旁完整尿一次，并拍下来", 5, 3),
    t("H6", "电梯厅多角度自拍", "拍到电梯厅环境，加上自己全裸，至少4张", 4),
    t("H7", "实时倒计时高危", "倒计时至少4分钟，期间电梯厅全裸并换姿势", 5),
    t("H8", "电梯厅狗姿巡视", "全裸狗姿在电梯厅缓慢移动一圈", 4),
    t("H10", "临时全脱冲刺", "衣物放在远处，全裸跑到电梯厅做完任务再取回", 5),
    t("H11", "电梯厅标记", "用尿液或前列腺液在电梯厅隐蔽处留下标记", 4, 3),
    t("H13", "电梯厅长时间守候", "选一个相对角落，全裸坚持至少5分钟", 5),
    t("H14", "按钮摩擦", "鸡巴轻轻摩擦电梯按钮面板（不实际按）", 4),
    t("H15", "电梯厅寸止", "电梯厅强制寸止至少两次", 5),
    t("H16", "电梯厅口塞", "嘴里塞着衣物，全裸在电梯厅跪下至少2分钟", 4),
    t("H17", "电梯厅最终展示", "全裸勃起面向电梯门站着，直到自己主动停", 5),
    t("H18", "排尿后边缘", "电梯厅先尿出来，立刻进入边缘", 5, 3),
    t("H19", "多位置快速暴露", "电梯厅至少三个不同位置各停留至少20s全裸", 4),
    t("H20", "强制拍摄环境", "电梯厅监控摄像头方向也拍进照片", 5),
    t("H21", "缓慢脱衣仪式（电梯厅版）", "电梯厅用最慢速度脱光", 4),
    t("H22", "电梯厅爬行", "全裸爬行穿过电梯厅", 5),
    t("H24", "终极地狱", "全裸，尿出来，边缘，拍摄，全部在电梯厅连续做完", 6, 3),
  ],
};

export const endingsNormal: EndingDef[] = [
  { minScore: 40, description: "怎么射、在哪射都随你，也可以不射，完成后回家" },
  { minScore: 30, description: "射到短袜上，含住至少10s，完成后回家" },
  { minScore: 20, description: "全裸跪下射出来，用身体或舌头舔干净，完成后回家" },
  { minScore: 10, description: "射到身上多处，拍下来，舔干净，完成后回家" },
  { minScore: 1, description: "不准射，裸体罚跪至少15分钟，戴贞操锁3天，短袜塞嘴里回家" },
  /** 结算不直接展示；由 resolveEnding 抽出一项 C 级任务后再落到上一档正文 */
  { minScore: 0, description: "当场再抽一项C级任务做完，再按1–9分结局执行" },
];

export const endingsHell: EndingDef[] = [
  { minScore: 60, description: "电梯厅不用再做任何事，马上回家，拿到「地狱幸存者」" },
  { minScore: 45, description: "电梯厅正中央全裸边缘至少两次，完成后才能射，再回家" },
  { minScore: 30, description: "电梯厅先完整尿出来，立刻边缘一次，再射出来，完成后回家" },
  { minScore: 15, description: "电梯厅全裸罚跪至少5分钟，拍下来，完成后回家" },
  { minScore: 0, description: "电梯厅全裸，尿出来，不准射，戴贞操锁7天，短袜塞嘴里回家" },
];

/** @deprecated 使用 endingsNormal / getEnding(score, mode) */
export const endings = endingsNormal;

export function getPersonaLabel(persona: Persona = "male"): string {
  return persona === "female" ? "母狗" : "公狗";
}

export function formatRunLabel(
  mode: GameMode = "normal",
  persona: Persona = "male",
): string {
  return `${mode === "hell" ? "地狱" : "普通"} · ${getPersonaLabel(persona)}`;
}

export function getTasks(persona: Persona = "male"): Record<string, Task[]> {
  return persona === "female" ? tasksFemale : tasks;
}

export function getEndings(mode: GameMode = "normal", persona: Persona = "male"): EndingDef[] {
  if (persona === "female") {
    return mode === "hell" ? endingsHellFemale : endingsNormalFemale;
  }
  return mode === "hell" ? endingsHell : endingsNormal;
}

export const shopItems: ShopItem[] = [
  {
    id: "长裤",
    name: "长裤",
    description: "遮盖下半身",
    price: 5,
    required: true,
    type: "clothing",
    clothingKey: "长裤",
  },
  {
    id: "上衣",
    name: "上衣",
    description: "遮挡上半身",
    price: 4,
    type: "clothing",
    clothingKey: "上衣",
  },
  {
    id: "内裤",
    name: "内裤",
    description: "遮住你最私密的部位",
    price: 4,
    type: "clothing",
    clothingKey: "内裤",
  },
  {
    id: "短袜",
    name: "短袜",
    description: "避免楼道的灰尘粘在脚上",
    price: 2,
    type: "clothing",
    clothingKey: "短袜",
  },
  {
    id: "护膝",
    name: "护膝",
    description: "减少膝盖擦伤。不参与剥夺衣物。",
    price: 2,
    type: "clothing",
    clothingKey: "护膝",
  },
  {
    id: "skip",
    name: "跳过任务券",
    description: "立刻跳过当前任务，不完成也过关。可买多张。",
    price: 6,
    type: "skip",
  },
  {
    id: "restore",
    name: "恢复内裤券",
    description: "内裤被脱掉后可穿回去。限购 1 次。",
    price: 8,
    type: "restore",
  },
  {
    id: "delayStrip",
    name: "延迟剥夺衣物券",
    description: "下次该脱衣时，可推迟到下一层再判定。",
    price: 5,
    type: "delayStrip",
  },
  {
    id: "riskDouble",
    name: "风险加倍券",
    description: "本局暴露加分 ×1.5，但脱衣更容易发生。限购 1 次。",
    price: 6,
    type: "riskDouble",
  },
];

export function rollStartingScore(mode: GameMode = "normal"): number {
  // 0–22（语义含必购长裤 5 分）；地狱额外 -3
  let score = Math.floor(Math.random() * 23);
  if (mode === "hell") {
    score = Math.max(0, score - 3);
  }
  return score;
}

export function createInitialGameState(
  startingFloor = 1,
  mode: GameMode = "normal",
  persona: Persona = "male",
): GameState {
  return {
    score: rollStartingScore(mode),
    currentFloor: 1,
    maxFloor: 1,
    startingFloor,
    gamePhase: "initial",
    mode,
    selectedMode: mode,
    persona,
    clothing: {
      上衣: false,
      长裤: false,
      内裤: false,
      短袜: false,
      护膝: false,
    },
    currentTask: null,
    taskMessage: null,
    tasksCompleted: 0,
    tasksCompletedInPhase: { A: 0, B: 0, C: 0, H: 0 },
    currentPhase: "A",
    inventory: {
      skip: 0,
      restore: 0,
      delayStrip: 0,
      riskDouble: 0,
    },
    assignedClimbingTask: null,
    eighthFloorFirstTaskCompleted: false,
    hasBoughtRestore: false,
    hasBoughtRiskDouble: false,
    riskDoubleActive: false,
    pendingDelayedStrip: false,
    urineMarks: 0,
    hellTasksCompleted: 0,
    progressStepsCompleted: 0,
    owned: createDefaultOwnedInventory(),
    missionPlan: null,
    resolvedEnding: null,
    scoreRerollsUsed: 0,
    taskReplacementsUsed: 0,
    replacedTaskIds: [],
  };
}

export function getDisplayFloor(
  internalFloor: number,
  startingFloor: number,
): number {
  return internalFloor + startingFloor - 1;
}

export function getEnding(
  score: number,
  mode: GameMode = "normal",
  persona: Persona = "male",
): string {
  const list = getEndings(mode, persona);
  for (const ending of list) {
    if (score >= ending.minScore) {
      return ending.description;
    }
  }
  return list[list.length - 1].description;
}

export function getProgressPercent(state: GameState): number {
  if (state.gamePhase === "ended") return 100;
  const total = getTotalProgressSteps(state.mode);
  return Math.min(100, (state.progressStepsCompleted / total) * 100);
}

export function getTaskPoolForFloor(
  floor: number,
  mode: GameMode = "normal",
  persona: Persona = "male",
): { pool: Task[]; phase: string } | null {
  const pool = getTasks(persona);
  if (floor === 1 || floor === 2) return { pool: pool.A, phase: "A" };
  if (floor === 4 || floor === 5) return { pool: pool.B, phase: "B" };
  if (floor === 7 || floor === 8) return { pool: pool.C, phase: "C" };
  if (mode === "hell" && (floor === 9 || floor === 11)) {
    return { pool: pool.H, phase: "H" };
  }
  return null;
}

export function pickRandomTask(pool: Task[], excludeId?: string): Task {
  if (pool.length === 0) {
    throw new Error("Task pool is empty");
  }
  if (!excludeId || pool.length === 1) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  let task: Task;
  do {
    task = pool[Math.floor(Math.random() * pool.length)];
  } while (task.id === excludeId);
  return task;
}

export function calculateTaskScore(state: GameState): number {
  if (!state.currentTask) return 0;
  const baseScore = state.currentTask.baseScore;
  const wornCount = KEY_CLOTHING_ITEMS.filter(
    (item) => state.clothing[item],
  ).length;
  let clothingBonus = KEY_CLOTHING_ITEMS.length - wornCount;
  // 地狱模式暴露加成额外 +1
  if (state.mode === "hell") {
    clothingBonus += 1;
  }
  // 风险加倍券：暴露加成 ×1.5
  if (state.riskDoubleActive) {
    clothingBonus = Math.floor(clothingBonus * 1.5);
  }
  const urineBonus = state.currentTask.urineBonus ?? 0;
  return baseScore + clothingBonus + urineBonus;
}

export function getWornClothingCount(state: GameState): number {
  return Object.values(state.clothing).filter(Boolean).length;
}

/** 剥夺衣物触发阈值：普通 ≤3(50%)；地狱/风险加倍 ≤4(66%)；风险加倍升至 70%≈≤4.2 用 ≤4 */
export function getStripDiceThreshold(state: GameState): number {
  if (state.riskDoubleActive) return 4; // ~66–70%
  if (state.mode === "hell") return 4;
  return 3;
}

/** 保留衣物费用：普通 5；地狱电梯厅任务 8 */
export function getKeepClothingCost(state: GameState): number {
  if (state.mode === "hell" && (state.currentFloor === 9 || state.currentFloor === 11)) {
    return 8;
  }
  return 5;
}

export function viewFromPhase(phase: GameState["gamePhase"]): import("./types").AppView {
  switch (phase) {
    case "shop":
      return "shop";
    case "adventure":
      return "game";
    case "ended":
      return "end";
    default:
      return "start";
  }
}
