import {  reactive } from 'vue'
import { DashboardModel } from '@/wordManagement/DashboardModel';
import type { InitialData } from './fetchInitialData';

interface GlobalData {
  initialData?: InitialData;
  dashboardModel?: DashboardModel;
}

export const globalData: GlobalData = reactive({});

// @ts-expect-error global
window.globalData = globalData