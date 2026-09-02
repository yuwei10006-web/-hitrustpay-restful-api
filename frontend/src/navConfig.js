export const NAV_GROUPS = [
  {
    title: "信用卡交易",
    items: [
      {
        path: "/authorization",
        label: "授權",
        icon: "CreditCard",
        enabled: true,
      },
      {
        path: "/authorization-ssl",
        label: "直接授權(SSL)",
        icon: "CreditCard",
        enabled: true,
      },
      {
        path: "/authorization-reverse",
        label: "取消授權",
        icon: "Undo2",
        enabled: true,
      },
      { path: "/capture", label: "請款", icon: "Banknote", enabled: true },
      {
        path: "/capture-reverse",
        label: "取消請款",
        icon: "Undo2",
        enabled: true,
      },
      { path: "/refund", label: "退款", icon: "RotateCcw", enabled: true },
      {
        path: "/refund-reverse",
        label: "取消退款",
        icon: "Undo2",
        enabled: true,
      },
      { path: "/query", label: "訂單查詢", icon: "Search", enabled: true },
      {
        path: "/binding-card-auth",
        label: "信用卡綁卡",
        icon: "ShieldCheck",
        enabled: true,
      },
      {
        path: "/authorization-ssl-token",
        label: "直接授權含Token",
        icon: "CreditCard",
        enabled: true,
      },
      {
        path: "/authorization-3d-token",
        label: "3D授權含Token",
        icon: "ShieldCheck",
        enabled: true,
      },
    ],
  },
  {
    title: "定期定額",
    items: [
      {
        path: "/sip-create",
        label: "建立定期定額",
        icon: "Repeat",
        enabled: true,
      },
      {
        path: "/sip-query",
        label: "定期定額查詢",
        icon: "Repeat",
        enabled: true,
      },
      {
        path: "/sip-cancel",
        label: "定期定額取消",
        icon: "Repeat",
        enabled: true,
      },
    ],
  },
  {
    title: "其他支付方式",
    items: [
      {
        path: "/follow-pay",
        label: "隨身付",
        icon: "Smartphone",
        enabled: true,
      },
      {
        path: "/apple-pay",
        label: "Apple Pay",
        icon: "Smartphone",
        enabled: true,
      },
      {
        path: "/line-pay",
        label: "LINE Pay",
        icon: "Smartphone",
        enabled: true,
      },
    ],
  },
];
