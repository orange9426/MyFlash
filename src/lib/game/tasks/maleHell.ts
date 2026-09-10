import type { TaskPools } from "./schema";

// 原始正文和需求在同一个任务对象中配置。
export const maleHellTasks: TaskPools = {
  "楼层任务": [
    {
      "id": "A1",
      "name": "舔脏袜",
      "description": "穿短袜原地走3圈，舔袜面或袜趾，含进嘴里1次，完成后袜子不能擦",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "wear": {
          "短袜": "wrap"
        }
      }
    },
    {
      "id": "A2",
      "name": "揉鸡巴",
      "description": "跪下，掏出鸡巴揉",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "A3",
      "name": "狗叼内裤",
      "description": "内裤脱下后叼进嘴里，含住至少10s",
      "baseScore": 1,
      "needs": {
        "requireAll": [
          "内裤"
        ],
        "wear": {
          "内裤": "mouth"
        }
      }
    },
    {
      "id": "A4",
      "name": "短袜自慰",
      "description": "短袜套在鸡巴上，撸至少30s，不准射",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "wear": {
          "短袜": "wrap"
        }
      }
    },
    {
      "id": "A5",
      "name": "乳头刺激",
      "description": "上衣卷起，两乳头紧贴冷墙至少1分钟，不能出声",
      "baseScore": 1,
      "needs": {
        "wear": {
          "上衣": "rolled"
        }
      }
    },
    {
      "id": "A6",
      "name": "狗姿被操",
      "description": "狗姿抵墙，模拟被操至少10下，边做边娇喘",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true
      }
    },
    {
      "id": "A7",
      "name": "墙角磨裆",
      "description": "面对墙角，下体紧贴墙面前后摩擦至少30下，边蹭边轻喘",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "A8",
      "name": "短袜套头",
      "description": "把脱下的短袜套在鸡巴头上，保持至少1分钟，期间不能碰",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "wear": {
          "短袜": "wrap"
        }
      }
    },
    {
      "id": "A9",
      "name": "跪地数台阶",
      "description": "跪下从当前层走到下一层，每级台阶用舌头轻舔一次",
      "baseScore": 2,
      "needs": {
        "kneeling": true
      }
    },
    {
      "id": "A11",
      "name": "冷风吹鸡巴",
      "description": "打开楼道窗（若有）或对着通风口，鸡巴完全露在风里至少2分钟",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "A12",
      "name": "镜面摩擦",
      "description": "鸡巴头在防火门上轻轻蹭，蹭出至少3条水痕",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "A13",
      "name": "轻度憋尿展示",
      "description": "憋到有感觉，楼梯转角掏出鸡巴，用尿在地面画一个小圈",
      "baseScore": 2,
      "urineBonus": 1,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "urine": true
      }
    },
    {
      "id": "A14",
      "name": "尿湿短袜",
      "description": "脱下一只短袜，用少量尿湿透，再穿上，走完本层",
      "baseScore": 2,
      "urineBonus": 1,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "urine": true
      }
    },
    {
      "id": "A15",
      "name": "尿痕标记",
      "description": "鸡巴头蘸尿，在墙上点三个点，摆成三角",
      "baseScore": 2,
      "urineBonus": 1,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "urine": true
      }
    },
    {
      "id": "A16",
      "name": "跪尿",
      "description": "跪下把鸡巴压在台阶上，慢慢尿出一小段，用舌头把台阶舔干净",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "kneeling": true,
        "urine": true
      }
    },
    {
      "id": "A17",
      "name": "娇喘阶梯",
      "description": "每上一级台阶娇喘一声，连续至少10级",
      "baseScore": 2,
      "needs": {
        "sound": true
      }
    },
    {
      "id": "A18",
      "name": "狗叫爬行",
      "description": "四肢着地爬至少5米，每爬一步短促狗叫一声",
      "baseScore": 2,
      "needs": {
        "kneeling": true,
        "sound": true
      }
    },
    {
      "id": "A19",
      "name": "沉默忍耐",
      "description": "自己轻轻捏住乳头或鸡巴，完全不出声至少1分钟",
      "baseScore": 1,
      "needs": {}
    },
    {
      "id": "A20",
      "name": "边缘低语",
      "description": "边撸边对着墙缝低声说「我是暴露的狗」，至少重复10次",
      "baseScore": 2,
      "needs": {
        "sound": true
      }
    },
    {
      "id": "A21",
      "name": "临时口塞",
      "description": "内裤塞进嘴里，含住至少30s，期间继续走路",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "内裤"
        ],
        "wear": {
          "内裤": "mouth"
        }
      }
    },
    {
      "id": "A22",
      "name": "短袜绑手腕",
      "description": "用短袜把双手轻轻绑在背后，跪下保持至少1分钟",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "kneeling": true
      }
    },
    {
      "id": "A24",
      "name": "衣物堆放",
      "description": "把脱下的所有衣物整齐叠在台阶上，自己光着在旁边守至少1分钟",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "A25",
      "name": "低角度自拍",
      "description": "跪下露鸡巴，从下往上拍至少3张",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true,
        "photo": true
      }
    },
    {
      "id": "A26",
      "name": "影子展示",
      "description": "借楼道灯光，摆出夸张勃起影子，拍下来",
      "baseScore": 2,
      "needs": {
        "photo": true
      }
    },
    {
      "id": "A27",
      "name": "倒计时暴露",
      "description": "手机倒计时至少60s，期间下半身全裸站着",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "photo": true
      }
    },
    {
      "id": "A28",
      "name": "声音录制",
      "description": "录一段边撸边娇喘的音频，至少30s",
      "baseScore": 2,
      "needs": {
        "photo": true,
        "sound": true
      }
    },
    {
      "id": "A29",
      "name": "闻自己的味道",
      "description": "把刚脱下的内裤或短袜捂在鼻子上深吸至少10次",
      "baseScore": 1,
      "needs": {
        "requireAny": [
          [
            "内裤",
            "短袜"
          ]
        ]
      }
    },
    {
      "id": "A30",
      "name": "温度对比",
      "description": "冰凉金属扶手贴住龟头，保持至少20s",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "A31",
      "name": "缓慢脱衣表演",
      "description": "楼梯中间用最慢速度把内裤脱到脚踝，再提起来，至少重复3次",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "内裤"
        ]
      }
    },
    {
      "id": "A32",
      "name": "最后一滴",
      "description": "鸡巴上残留的前列腺液，用手指抹到嘴唇上，完成后才算过",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "B1",
      "name": "舔地",
      "description": "内裤垫地，跪着舔1级台阶，舔完再跪至少5s",
      "baseScore": 3,
      "needs": {
        "requireAll": [
          "内裤"
        ],
        "kneeling": true
      }
    },
    {
      "id": "B2",
      "name": "模拟做爱",
      "description": "光屁股面对墙撸鸡巴，往墙上撞至少3下，模拟做爱",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B3",
      "name": "勃起露出",
      "description": "露出勃起带血管的鸡巴头，拍至少3张不同角度",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B4",
      "name": "夹腿露出",
      "description": "脱下内裤包住鸡巴，夹腿，保持至少1分钟",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "内裤"
        ],
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B5",
      "name": "全裸露出",
      "description": "下半身全裸，长裤挂在脖子上，坚持至少2分钟",
      "baseScore": 3,
      "needs": {
        "requireAll": [
          "长裤"
        ],
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B6",
      "name": "狗姿摇屁股",
      "description": "下半身全裸，狗姿摇屁股至少1分钟",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true
      }
    },
    {
      "id": "B7",
      "name": "楼梯扶手摩擦",
      "description": "鸡巴沿扶手来回滑至少20下，留下水痕",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B8",
      "name": "转角全裸守候",
      "description": "转角处下半身全裸，站立或跪姿，坚持至少3分钟",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B9",
      "name": "双腿大开",
      "description": "坐在台阶上双腿完全打开，鸡巴朝向可能有人下来的方向，保持至少2分钟",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B10",
      "name": "屁股朝上",
      "description": "狗姿把屁股抬得比头高，保持至少1分半，期间可以轻轻摇",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true
      }
    },
    {
      "id": "B11",
      "name": "台阶排尿",
      "description": "选一级台阶，鸡巴对准台阶边缘慢慢尿，至少尿湿半级",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "urine": true
      }
    },
    {
      "id": "B12",
      "name": "尿后舔净",
      "description": "尿完用舌头把台阶上的尿舔到肉眼看不见",
      "baseScore": 4,
      "urineBonus": 2,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "B13",
      "name": "尿湿内裤再穿",
      "description": "把内裤脱下，用尿浸湿，再穿上，继续做后面的动作",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "requireAll": [
          "内裤"
        ],
        "urine": true
      }
    },
    {
      "id": "B14",
      "name": "标记转角",
      "description": "转角墙壁用尿写一个简单符号（如「狗」）",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "B16",
      "name": "多角度视频",
      "description": "录自己下半身全裸从狗姿到站立的完整过程，至少45s",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "photo": true
      }
    },
    {
      "id": "B17",
      "name": "倒计时挑战",
      "description": "倒计时至少2分钟，期间完成「脱内裤→撸20下→再穿上」循环至少3次",
      "baseScore": 3,
      "needs": {
        "requireAll": [
          "内裤"
        ],
        "photo": true
      }
    },
    {
      "id": "B19",
      "name": "影子实体",
      "description": "影子和实体暴露各拍至少2张",
      "baseScore": 2,
      "needs": {
        "photo": true
      }
    },
    {
      "id": "B20",
      "name": "轻打鸡巴",
      "description": "手掌轻轻拍打鸡巴两侧各至少10下，要拍出声音",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "B21",
      "name": "夹紧忍耐",
      "description": "双腿把鸡巴紧紧夹住至少1分钟，期间不能用手碰",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "B22",
      "name": "乳头拉扯",
      "description": "用力拉扯两边乳头，同时保持勃起至少30s",
      "baseScore": 2,
      "needs": {
        "wear": {
          "上衣": "rolled"
        }
      }
    },
    {
      "id": "B23",
      "name": "短袜堵嘴",
      "description": "两只短袜塞进嘴里，狗姿保持至少1分钟",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "wear": {
          "短袜": "mouth"
        },
        "kneeling": true
      }
    },
    {
      "id": "B25",
      "name": "防火门摩擦",
      "description": "鸡巴在防火门上缓慢画圈，至少5圈",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B26",
      "name": "通风口暴露",
      "description": "鸡巴伸向通风口，气流直接吹龟头至少2分钟",
      "baseScore": 2,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "B27",
      "name": "听筒羞耻",
      "description": "手机开免提放身边，假装有人在通话，自己继续暴露",
      "baseScore": 3,
      "needs": {
        "photo": true
      }
    },
    {
      "id": "B29",
      "name": "寸止一次",
      "description": "撸到即将高潮时强制停下，冷静至少30s再继续",
      "baseScore": 3,
      "needs": {}
    },
    {
      "id": "B30",
      "name": "前列腺液收集",
      "description": "流出的前列腺液全部用手指收集，抹在胸口",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "B31",
      "name": "边缘低语升级",
      "description": "边边缘边大声说「请路过的主人看狗鸡巴」，至少重复8次",
      "baseScore": 3,
      "needs": {
        "sound": true
      }
    },
    {
      "id": "B32",
      "name": "双任务连续",
      "description": "先狗姿摇屁股一次，紧接着立刻做一次夹腿露出",
      "baseScore": 3,
      "needs": {
        "requireAll": [
          "内裤"
        ],
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true
      }
    },
    {
      "id": "B34",
      "name": "温度刺激",
      "description": "楼道里较凉的金属，交替刺激龟头与乳头",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "B35",
      "name": "缓慢全脱",
      "description": "用超过2分钟，一件件把所有衣物脱下并整齐放好",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "B36",
      "name": "最终展示",
      "description": "下半身全裸站在楼梯中间至少10s，完成后才可穿回",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "C1",
      "name": "狗姿拍摄",
      "description": "下半身全裸，狗姿掰开屁股，保持至少1分钟并拍照",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true,
        "photo": true
      }
    },
    {
      "id": "C2",
      "name": "鸡巴贴地走",
      "description": "穿短袜，鸡巴贴地蹲着走，屁股大幅扭动至少3米",
      "baseScore": 3,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "wear": {
          "短袜": "on",
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "C3",
      "name": "超长跪姿暴露",
      "description": "鸡巴朝楼下，跪下至少10分钟，鸡巴头露着不能挡",
      "baseScore": 4,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true
      }
    },
    {
      "id": "C4",
      "name": "寸止挑战",
      "description": "撸到高潮并寸止至少2次",
      "baseScore": 3,
      "needs": {}
    },
    {
      "id": "C5",
      "name": "舔脚游戏",
      "description": "舔脚趾和脚掌，舔完且舔干净",
      "baseScore": 4,
      "needs": {
        "wear": {
          "短袜": "off"
        }
      }
    },
    {
      "id": "C6",
      "name": "阿努比斯摇",
      "description": "全裸，跳阿努比斯摇，录下来",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true,
        "photo": true
      }
    },
    {
      "id": "C7",
      "name": "全裸爬行",
      "description": "完全赤裸（含短袜也可脱）四肢着地，爬完整层楼梯的一半距离",
      "baseScore": 4,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true,
        "kneeling": true
      }
    },
    {
      "id": "C8",
      "name": "长时间站立暴露",
      "description": "下半身全裸站在楼梯最显眼处，坚持至少5分钟",
      "baseScore": 4,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "C9",
      "name": "单层暴露",
      "description": "上衣卷起，下半身全裸，保持至少3分钟",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "rolled",
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "C10",
      "name": "转角守候升级",
      "description": "转角全裸，鸡巴朝向可能来人的方向，坚持至少4分钟",
      "baseScore": 4,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "C11",
      "name": "完整排尿展示",
      "description": "楼梯中间站着，整泡尿全部尿在台阶上，过程录下来",
      "baseScore": 4,
      "urineBonus": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "urine": true,
        "photo": true
      }
    },
    {
      "id": "C12",
      "name": "尿后全身标记",
      "description": "用自己的尿在胸口、大腿、鸡巴上各画一条线",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "C13",
      "name": "尿湿全身",
      "description": "故意让尿溅到小腿和脚上，然后继续裸着做后面的动作",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "C14",
      "name": "舔尿台阶",
      "description": "刚才尿过的台阶，用舌头清理到基本干净",
      "baseScore": 4,
      "urineBonus": 3,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "C16",
      "name": "多角度视频升级",
      "description": "录完整「脱衣→暴露动作→排尿→再穿」全过程，至少90s",
      "baseScore": 4,
      "urineBonus": 2,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true,
        "urine": true,
        "photo": true
      }
    },
    {
      "id": "C17",
      "name": "实时倒计时暴露",
      "description": "倒计时至少5分钟，期间全裸，每隔30s换一个姿势",
      "baseScore": 4,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true,
        "photo": true
      }
    },
    {
      "id": "C18",
      "name": "声音最大化",
      "description": "尽可能大声狗叫，持续至少1分钟",
      "baseScore": 3,
      "needs": {
        "sound": true
      }
    },
    {
      "id": "C20",
      "name": "轻打升级",
      "description": "用手或衣物轻轻抽打鸡巴和屁股各至少15下",
      "baseScore": 3,
      "needs": {}
    },
    {
      "id": "C21",
      "name": "强制边缘三次",
      "description": "连续三次撸到高潮边缘再强制停下，每次间隔至少40s",
      "baseScore": 4,
      "needs": {}
    },
    {
      "id": "C22",
      "name": "乳头折磨",
      "description": "用力拧转乳头，同时狗姿保持至少1分半",
      "baseScore": 3,
      "needs": {
        "kneeling": true
      }
    },
    {
      "id": "C23",
      "name": "口塞暴露",
      "description": "用内裤或短袜塞嘴，下半身全裸跪下至少3分钟",
      "baseScore": 3,
      "needs": {
        "requireAny": [
          [
            "内裤",
            "短袜"
          ]
        ],
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true
      }
    },
    {
      "id": "C25",
      "name": "整层标记",
      "description": "本层至少三个不同位置留下尿液或前列腺液痕迹",
      "baseScore": 4,
      "urineBonus": 3,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "C26",
      "name": "扶手全摩擦",
      "description": "鸡巴把整段扶手从头到尾摩擦一遍",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "C27",
      "name": "通风口长时间",
      "description": "鸡巴长时间对着通风口，气流持续刺激至少3分钟",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "C28",
      "name": "听筒暴露",
      "description": "手机开免提，假装通话，同时做完一次完整暴露动作",
      "baseScore": 3,
      "needs": {
        "photo": true
      }
    },
    {
      "id": "C29",
      "name": "强制寸止两次",
      "description": "寸止两次，每次之后冷静满1分钟才能继续",
      "baseScore": 4,
      "needs": {}
    },
    {
      "id": "C30",
      "name": "前列腺液大量收集",
      "description": "尽可能多挤出前列腺液，全部涂在脸上或胸口",
      "baseScore": 3,
      "needs": {}
    },
    {
      "id": "C31",
      "name": "边缘宣言",
      "description": "边边缘边大声重复「我是楼道里的暴露公狗」至少15次",
      "baseScore": 3,
      "needs": {
        "sound": true
      }
    },
    {
      "id": "C32",
      "name": "连续高难度",
      "description": "先做一次超长跪姿，紧接着立刻鸡巴贴地走",
      "baseScore": 4,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "wear": {
          "短袜": "on",
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true
      }
    },
    {
      "id": "C33",
      "name": "衣物完全丢弃",
      "description": "所有衣物丢到楼梯下方或转角，自己全裸做完任务再取回",
      "baseScore": 4,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "C34",
      "name": "温度极端刺激",
      "description": "最凉的金属和自己的体温，交替刺激敏感部位",
      "baseScore": 3,
      "needs": {}
    },
    {
      "id": "C35",
      "name": "极慢脱衣仪式",
      "description": "用超过4分钟一件件脱光，每脱一件摆一个姿势",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "C36",
      "name": "最终全裸巡视",
      "description": "全裸在本层来回走一圈，至少来回一次，完成后才算过",
      "baseScore": 4,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "C38",
      "name": "尿精边缘",
      "description": "边缘状态下往鸡巴上滴几滴尿，然后继续边缘",
      "baseScore": 4,
      "urineBonus": 2,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "C39",
      "name": "狗姿持续摇",
      "description": "狗姿保持的同时持续摇屁股至少3分钟",
      "baseScore": 3,
      "needs": {
        "kneeling": true
      }
    },
    {
      "id": "C40",
      "name": "终极展示",
      "description": "全裸、勃起，面对可能来人的方向站着，坚持到自己主动停（最长5分钟）",
      "baseScore": 4,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    }
  ],
  "上楼任务": [
    {
      "id": "U1",
      "name": "狗姿上楼",
      "description": "全程狗姿，仅穿短袜或全裸，往上爬2楼，脚不能着地",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "wear": {
          "短袜": "on",
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true,
        "kneeling": true
      }
    },
    {
      "id": "U2",
      "name": "跪姿上楼",
      "description": "每上一级台阶膝盖至少落地1次，往上爬2楼",
      "baseScore": 2,
      "needs": {
        "kneeling": true
      }
    },
    {
      "id": "U3",
      "name": "露出上楼",
      "description": "将内裤脱下叼在嘴里，同时下半身全裸，往上爬2楼",
      "baseScore": 3,
      "needs": {
        "requireAll": [
          "内裤"
        ],
        "wear": {
          "内裤": "off",
          "长裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "U4",
      "name": "披风上楼",
      "description": "裤子挂在脖子上，全裸往上2楼。可自由选择爬or走。",
      "baseScore": 2,
      "needs": {
        "requireAll": [
          "长裤"
        ],
        "wear": {
          "长裤": "off",
          "上衣": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "U5",
      "name": "边缘上楼",
      "description": "边撸鸡巴边缘，边爬1层",
      "baseScore": 3,
      "needs": {}
    },
    {
      "id": "U6",
      "name": "赤脚上楼",
      "description": "赤脚慢走，每一步停至少0.5s，露出鸡巴",
      "baseScore": 2,
      "needs": {
        "wear": {
          "短袜": "off",
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "U7",
      "name": "全裸爬楼",
      "description": "完全赤裸四肢着地爬完一层",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true,
        "kneeling": true
      }
    },
    {
      "id": "U8",
      "name": "尿迹上楼",
      "description": "边爬边在每层台阶留下一点尿",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "U9",
      "name": "口塞上楼",
      "description": "嘴里塞着内裤或短袜，全裸或半裸爬一层",
      "baseScore": 3,
      "needs": {
        "requireAny": [
          [
            "内裤",
            "短袜"
          ]
        ]
      }
    },
    {
      "id": "U11",
      "name": "边尿边上",
      "description": "上楼过程中至少释放一次尿",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "U12",
      "name": "倒计时上楼",
      "description": "设置严格时间限制，超时则额外惩罚（随机脱衣）",
      "baseScore": 3,
      "needs": {
        "photo": true
      }
    },
    {
      "id": "U14",
      "name": "声音上楼",
      "description": "每上一级发出明显狗叫",
      "baseScore": 2,
      "needs": {
        "sound": true
      }
    },
    {
      "id": "U15",
      "name": "摩擦上楼",
      "description": "鸡巴持续与扶手或墙面保持接触",
      "baseScore": 3,
      "needs": {
        "wear": {
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "U16",
      "name": "临时全脱上楼",
      "description": "上楼前把所有衣物丢在起始层，全裸爬完再取回",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "U17",
      "name": "多姿势切换",
      "description": "上楼过程中至少切换3种姿势（狗、跪、蹲）",
      "baseScore": 3,
      "needs": {
        "kneeling": true
      }
    },
    {
      "id": "U18",
      "name": "边缘坚持上楼",
      "description": "全程保持边缘，不准射",
      "baseScore": 3,
      "needs": {}
    },
    {
      "id": "U19",
      "name": "标记上楼",
      "description": "每层至少留下一处体液标记",
      "baseScore": 3,
      "urineBonus": 2,
      "needs": {
        "urine": true
      }
    },
    {
      "id": "U20",
      "name": "缓慢惩罚上楼",
      "description": "每一步停顿至少1s，全程用最慢速度",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "U22",
      "name": "短袜套头上楼",
      "description": "短袜套在鸡巴上，完成整个上楼过程",
      "baseScore": 3,
      "needs": {
        "requireAll": [
          "短袜"
        ],
        "wear": {
          "短袜": "wrap"
        }
      }
    },
    {
      "id": "U23",
      "name": "单层暴露上楼",
      "description": "上衣卷起，下半身全裸，爬一层",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "rolled",
          "长裤": "off",
          "内裤": "off"
        },
        "lowerBare": true
      }
    },
    {
      "id": "U28",
      "name": "温度刺激上楼",
      "description": "楼道金属持续刺激敏感部位",
      "baseScore": 2,
      "needs": {}
    },
    {
      "id": "U29",
      "name": "最终冲刺",
      "description": "最后半层用最快速度全裸冲",
      "baseScore": 3,
      "needs": {
        "wear": {
          "上衣": "off",
          "长裤": "off",
          "内裤": "off",
          "短袜": "off"
        },
        "fullyBare": true
      }
    },
    {
      "id": "U30",
      "name": "完整仪式上楼",
      "description": "上楼前先做一次短暴露，再开始爬",
      "baseScore": 3,
      "needs": {}
    }
  ]
};
