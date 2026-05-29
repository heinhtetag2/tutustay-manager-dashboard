import { createBrowserRouter } from 'react-router';
import Layout from './Layout';
import Dashboard from '@/pages/dashboard';
import SurveyFeed from '@/pages/survey-feed';
import MySurveys from '@/pages/my-surveys';
import SurveyTake from '@/pages/survey-take';
import SurveyPlay from '@/pages/survey-play';
import Surveys from '@/pages/surveys';
import SurveyBuilder from '@/pages/survey-builder';
import SurveyDetail from '@/pages/survey-detail';
import Billing from '@/pages/billing';
import Payouts from '@/pages/payouts';
import Wallet from '@/pages/wallet';
import Companies from '@/pages/companies';
import CompanyDetail from '@/pages/company-detail';
import Respondents from '@/pages/respondents';
import RespondentDetail from '@/pages/respondent-detail';
import Reports from '@/pages/reports';
import Agents from '@/pages/agents';
import AgentDetail from '@/pages/agents/AgentDetail';
import Help from '@/pages/help';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'dashboard', Component: Dashboard },
      { path: 'survey-feed', Component: SurveyFeed },
      { path: 'my-surveys', Component: MySurveys },
      { path: 'my-surveys/:id', Component: SurveyTake },
      { path: 'survey-feed/:id', Component: SurveyTake },
      { path: 'survey-feed/:id/play', Component: SurveyPlay },
      { path: 'surveys', Component: Surveys },
      { path: 'surveys/new', Component: SurveyBuilder },
      { path: 'surveys/:id', Component: SurveyDetail },
      { path: 'companies', Component: Companies },
      { path: 'companies/:id', Component: CompanyDetail },
      { path: 'respondents', Component: Respondents },
      { path: 'respondents/:id', Component: RespondentDetail },
      { path: 'reports', Component: Reports },
      { path: 'agents', Component: Agents },
      { path: 'agents/:id', Component: AgentDetail },
      { path: 'billing', Component: Billing },
      { path: 'payouts', Component: Payouts },
      { path: 'wallet', Component: Wallet },
      { path: 'help', Component: Help },
      { path: 'settings', Component: Settings },
      { path: '*', Component: NotFound },
    ],
  },
]);
