import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Main User Application Pages
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        plans: resolve(__dirname, 'plans.html'),
        planDetails: resolve(__dirname, 'plan-details.html'),
       investments: resolve(__dirname, 'investments.html'),
        //earnings: resolve(__dirname, 'earnings.html'),
      wallet: resolve(__dirname, 'wallet.html'),
      deposit: resolve(__dirname, 'deposit.html'),
        withdraw: resolve(__dirname, 'withdraw.html'),
       transactions: resolve(__dirname, 'transactions.html'),
        referrals: resolve(__dirname, 'referrals.html'),
        giftCode: resolve(__dirname, 'gift-code.html'),
        notifications: resolve(__dirname, 'notifications.html'),
        profile: resolve(__dirname, 'profile.html'),
        support: resolve(__dirname, 'support.html'),
        terms: resolve(__dirname, 'terms.html'),
        privacy: resolve(__dirname, 'privacy.html'),

        // Admin Management Suite
        //
        
        adminLogin: resolve(__dirname, 'admin/login.html'),
        adminIndex: resolve(__dirname, 'admin/index.html'),
       adminUsers: resolve(__dirname, 'admin/users.html'),
        adminUserDetails: resolve(__dirname, 'admin/user-details.html'),
        adminPlans: resolve(__dirname, 'admin/plans.html'),
        adminInvestments: resolve(__dirname, 'admin/investments.html'),
        adminDeposits: resolve(__dirname, 'admin/deposits.html'),
        adminWithdrawals: resolve(__dirname, 'admin/withdrawals.html'),
        adminTransactions: resolve(__dirname, 'admin/transactions.html'),
        adminReferrals: resolve(__dirname, 'admin/referrals.html'),
        adminGiftCodes: resolve(__dirname, 'admin/gift-codes.html'),
        //adminNotifications: resolve(__dirname, 'admin/notifications.html'),
        //adminReports: resolve(__dirname, 'admin/reports.html'),
       // adminSettings: resolve(__dirname, 'admin/settings.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
