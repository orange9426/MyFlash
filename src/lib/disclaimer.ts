/** 声明正文变更时递增，已同意的用户需重新确认。 */
export const DISCLAIMER_VERSION = 1;

export const DISCLAIMER_UPDATED_AT = "2026-08-23";

export const DISCLAIMER_TITLE = "免责声明与使用条款";

const ACK_KEY = "staircaseDisclaimerAck";

export interface DisclaimerAck {
  version: number;
  acceptedAt: string;
}

export interface DisclaimerSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const DISCLAIMER_SECTIONS: DisclaimerSection[] = [
  {
    id: "age",
    title: "一、年龄限制",
    paragraphs: [
      "本站含成人向性描写与裸露相关文字，仅向年满十八周岁（或你所在司法辖区规定的成年年龄，以较高者为准）的人士开放。未成年人禁止访问、使用或传播本站内容。",
      "进入本站前，你必须自行确认已达法定成年年龄。本站无法核验真实身份，你的确认即构成对年龄的陈述与保证。",
    ],
  },
  {
    id: "content",
    title: "二、内容说明",
    paragraphs: [
      "《楼道暴露挑战》是基于文字的角色扮演与情境模拟。内容可能涉及裸露、性行为描写、暴露癖、羞耻、支配与服从、体液等成人主题，可能引起强烈不适。",
      "所有角色与情境均设定为已成年。本站不提供、不展示、不索取任何真实未成年人相关内容。",
    ],
  },
  {
    id: "fiction",
    title: "三、虚构模拟，不是行动指南",
    paragraphs: [
      "本游戏纯属虚构。任务文案、积分规则与结局仅为娱乐设定，不构成建议、教唆、指导或鼓励你在现实中实施任何行为。",
      "请勿在楼道、电梯厅、街道、公园、交通工具、他人住宅或任何公共及半公共场所实施暴露、性行为、破坏公物、干扰他人或其他可能违法、危险或不道德的行为。",
    ],
    bullets: [
      "在公共场所裸体或暴露性器官，在多数地区属于违法行为；",
      "在公共场所进行性行为、拍摄或传播相关影像，可能构成违法甚至犯罪；",
      "未经同意将他人卷入、拍摄或传播，可能侵犯人格权并承担法律责任；",
      "若你所在地禁止浏览或持有此类成人内容，请立即离开本站。",
    ],
  },
  {
    id: "prohibited",
    title: "四、禁止事项",
    paragraphs: ["使用本站时，你不得："],
    bullets: [
      "向未成年人展示、转发或提供本站链接与内容；",
      "将本站内容理解为对违法行为的鼓励、教唆或操作手册；",
      "在现实中实施可能违法、伤害自己或他人、侵犯他人权益的行为；",
      "上传、发布或索取真实违法影像，或任何涉及未成年人的内容。",
    ],
  },
  {
    id: "liability",
    title: "五、责任限制",
    paragraphs: [
      "你自愿访问并使用本站，自行承担全部风险。作者、贡献者、域名持有人及托管服务提供方，在适用法律允许的最大范围内，不对下列事项承担责任：",
    ],
    bullets: [
      "因阅读或使用本站引起的任何生理伤害、心理不适、情绪困扰；",
      "因模仿、实施或误解游戏内容导致的行政处罚、刑事责任、民事赔偿或其他法律后果；",
      "设备损坏、数据丢失、第三方服务中断或访问被限制；",
      "其他间接、附带、惩罚性或后果性损失。",
    ],
  },
  {
    id: "promise",
    title: "六、用户确认",
    paragraphs: [
      "点击同意并进入，即表示你确认：已满十八周岁；所在地法律允许你浏览此类内容；已阅读、理解并同意本声明全部条款；不会将游戏内容付诸任何违法或危险的现实行为；若感到不适，会立即停止使用。",
    ],
  },
  {
    id: "privacy",
    title: "七、隐私与数据",
    paragraphs: [
      "本站不设账号，不主动采集姓名、证件号、精确位置等个人身份信息。游戏进度与历史记录仅保存在你使用的浏览器本地存储（localStorage）中，可随清除站点数据而删除。",
      "本站以静态页面形式托管。托管方、网络运营商或你使用的浏览器可能会记录常规访问日志（如 IP、User-Agent）。作者无法控制上述第三方处理。",
    ],
  },
  {
    id: "exit",
    title: "八、停止使用",
    paragraphs: [
      "你可随时关闭页面、清除本站本地数据并停止使用。若内容使你不适，请立即离开，并在需要时向当地专业机构寻求帮助。",
    ],
  },
  {
    id: "misc",
    title: "九、其他",
    paragraphs: [
      "本声明可能不定期修订。修订后将提升版本号，你需重新阅读并确认后方可继续使用。",
      "本声明部分条款如被认定为无效，不影响其余条款效力。本声明不构成法律建议。强制性法律规定不得排除的权利，不受本声明限制。",
      "继续使用本站，即视为你已阅读并同意受本声明约束。",
    ],
  },
];

export function loadDisclaimerAck(): boolean {
  try {
    const raw = localStorage.getItem(ACK_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as DisclaimerAck;
    return parsed.version === DISCLAIMER_VERSION;
  } catch {
    return false;
  }
}

export function saveDisclaimerAck(): void {
  try {
    const payload: DisclaimerAck = {
      version: DISCLAIMER_VERSION,
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem(ACK_KEY, JSON.stringify(payload));
  } catch {
    // 忽略 quota / 私有模式等写入失败
  }
}
