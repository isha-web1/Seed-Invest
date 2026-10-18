import {
  Home,
  Compass,
  HandCoins,
  CreditCard,
  ReceiptText,
  PlusCircle,
  FolderKanban,
  Banknote,
  Users,
  Megaphone,
  ClipboardCheck,
  Flag,
} from "lucide-react";

export const dashboardNav = {
  supporter: [
    { label: "Home", href: "/dashboard/supporter", icon: Home },
    { label: "Explore Campaigns", href: "/explore", icon: Compass },
    { label: "My Contributions", href: "/dashboard/supporter/my-contributions", icon: HandCoins },
    { label: "Purchase Credit", href: "/dashboard/supporter/purchase-credit", icon: CreditCard },
    { label: "Payment History", href: "/dashboard/supporter/payment-history", icon: ReceiptText },
  ],
  creator: [
    { label: "Home", href: "/dashboard/creator", icon: Home },
    { label: "Add New Campaign", href: "/dashboard/creator/add-campaign", icon: PlusCircle },
    { label: "My Campaigns", href: "/dashboard/creator/my-campaigns", icon: FolderKanban },
    { label: "Withdrawals", href: "/dashboard/creator/withdrawals", icon: Banknote },
    { label: "Payment History", href: "/dashboard/creator/payment-history", icon: ReceiptText },
  ],
  admin: [
    { label: "Home", href: "/dashboard/admin", icon: Home },
    { label: "Campaign Approvals", href: "/dashboard/admin/campaign-approvals", icon: ClipboardCheck },
    { label: "Manage Users", href: "/dashboard/admin/manage-users", icon: Users },
    { label: "Manage Campaigns", href: "/dashboard/admin/manage-campaigns", icon: Megaphone },
    { label: "Withdrawal Requests", href: "/dashboard/admin/withdrawal-requests", icon: Banknote },
    { label: "Reports", href: "/dashboard/admin/reports", icon: Flag },
  ],
};

export const roleHome = {
  supporter: "/dashboard/supporter",
  creator: "/dashboard/creator",
  admin: "/dashboard/admin",
};
