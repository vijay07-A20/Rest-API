import React, { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewSection } from './components/sections/OverviewSection';
import { TrafficSection } from './components/sections/TrafficSection';
import { RateLimitSection } from './components/sections/RateLimitSection';
import { AbuseDetectionSection } from './components/sections/AbuseDetectionSection';
import { DfaMonitorSection } from './components/sections/DfaMonitorSection';
import { RequestLogsSection } from './components/sections/RequestLogsSection';
import { AnalyticsSection } from './components/sections/AnalyticsSection';
import { SettingsSection } from './components/sections/SettingsSection';
import { AcademicConceptsSection } from './components/sections/AcademicConceptsSection';
import { TestHarnessSection } from './components/sections/TestHarnessSection';
import { apiService } from './services/api';

export default function App() {
  const [currentSection, setCurrentSection] = useState('overview');
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const {
    stats,
    requests,
    alerts,
    dfaState,
    rateLimitStatus,
    settings,
    networkInfo,
    analytics,
    isConnected,
    isRefreshing,
    lastUpdated,
    refreshData,
  } = useDashboardData(3000);

  const handleSimulateBatch = async (scenario = 'BURST_ATTACK', count = 100) => {
    try {
      await apiService.sendBatchSimulation({
        scenario,
        count,
        simulatedIp: '203.0.113.88',
      });
      refreshData();
    } catch (e) {
      console.error('Simulation error:', e);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        alertCount={alerts.length}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          isConnected={isConnected}
          isRefreshing={isRefreshing}
          onRefresh={refreshData}
          dfaState={dfaState}
          stats={stats}
          onOpenSimModal={() => setCurrentSection('harness')}
        />

        <main className="page-wrapper">
          {currentSection === 'overview' && (
            <OverviewSection
              stats={stats}
              requests={requests}
              alerts={alerts}
              dfaState={dfaState}
              analytics={analytics}
              onSelectSection={setCurrentSection}
              onSimulate={handleSimulateBatch}
            />
          )}

          {currentSection === 'traffic' && (
            <TrafficSection
              requests={requests}
              stats={stats}
              analytics={analytics}
            />
          )}

          {currentSection === 'ratelimit' && (
            <RateLimitSection
              rateLimitStatus={rateLimitStatus}
              settings={settings}
              onRefresh={refreshData}
            />
          )}

          {currentSection === 'abuse' && (
            <AbuseDetectionSection
              alerts={alerts}
              onSimulate={handleSimulateBatch}
            />
          )}

          {currentSection === 'dfa' && (
            <DfaMonitorSection
              dfaState={dfaState}
            />
          )}

          {currentSection === 'logs' && (
            <RequestLogsSection
              requests={requests}
            />
          )}

          {currentSection === 'analytics' && (
            <AnalyticsSection
              analytics={analytics}
              stats={stats}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsSection
              settings={settings}
              onRefresh={refreshData}
            />
          )}

          {currentSection === 'academic' && (
            <AcademicConceptsSection />
          )}

          {currentSection === 'harness' && (
            <TestHarnessSection
              onRefresh={refreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
