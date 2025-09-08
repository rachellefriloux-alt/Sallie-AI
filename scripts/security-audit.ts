/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie AI - Security Audit and Compliance System                           │
 * │                                                                              │
 * │   Comprehensive security auditing and compliance monitoring for production   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'authentication' | 'authorization' | 'data_access' | 'system_access' | 'security_config' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  user?: string;
  ip?: string;
  resource?: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  details: Record<string, any>;
  complianceTags: string[];
}

export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  standard: 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOX' | 'ISO27001' | 'NIST' | 'CUSTOM';
  category: 'data_protection' | 'access_control' | 'encryption' | 'monitoring' | 'incident_response';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastRun?: Date;
  status: 'passed' | 'failed' | 'warning' | 'not_run';
  findings: ComplianceFinding[];
  remediationSteps: string[];
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'password' | 'access' | 'data' | 'network' | 'monitoring';
  rules: SecurityRule[];
  enabled: boolean;
  enforcement: 'strict' | 'permissive' | 'audit_only';
}

export interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'audit' | 'alert';
  parameters: Record<string, any>;
  priority: number;
}

export interface VulnerabilityScan {
  id: string;
  timestamp: Date;
  target: string;
  scanner: string;
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  status: 'completed' | 'failed' | 'in_progress';
}

export interface Vulnerability {
  id: string;
  cve?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvssScore?: number;
  affectedPackage: string;
  currentVersion: string;
  fixedVersion?: string;
  references: string[];
  status: 'open' | 'patched' | 'accepted_risk' | 'false_positive';
}

export interface SecurityMetrics {
  totalEvents: number;
  failedAuthentications: number;
  suspiciousActivities: number;
  dataAccessViolations: number;
  complianceScore: number;
  lastScanDate?: Date;
  activeVulnerabilities: number;
  encryptionCoverage: number;
}

/**
 * Security Audit and Compliance Manager
 */
export class SecurityAuditComplianceManager extends EventEmitter {
  private securityEvents: SecurityEvent[] = [];
  private complianceChecks: Map<string, ComplianceCheck> = new Map();
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private vulnerabilityScans: VulnerabilityScan[] = [];
  private metrics!: SecurityMetrics;

  private auditInterval: NodeJS.Timeout | null = null;
  private complianceInterval: NodeJS.Timeout | null = null;
  private vulnerabilityScanInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeDefaultComplianceChecks();
    this.initializeDefaultSecurityPolicies();
    this.initializeMetrics();
  }

  /**
   * Initialize default compliance checks
   */
  private initializeDefaultComplianceChecks(): void {
    const defaultChecks: ComplianceCheck[] = [
      {
        id: 'gdpr_data_protection',
        name: 'GDPR Data Protection',
        description: 'Ensure compliance with GDPR data protection requirements',
        standard: 'GDPR',
        category: 'data_protection',
        frequency: 'continuous',
        status: 'not_run',
        findings: [],
        remediationSteps: [
          'Implement data encryption at rest and in transit',
          'Conduct data mapping and classification',
          'Establish data retention policies',
          'Implement data subject access request process'
        ]
      },
      {
        id: 'access_control_review',
        name: 'Access Control Review',
        description: 'Review and validate access control mechanisms',
        standard: 'ISO27001',
        category: 'access_control',
        frequency: 'weekly',
        status: 'not_run',
        findings: [],
        remediationSteps: [
          'Implement role-based access control (RBAC)',
          'Regular access rights review',
          'Multi-factor authentication for privileged accounts',
          'Session timeout policies'
        ]
      },
      {
        id: 'encryption_validation',
        name: 'Encryption Validation',
        description: 'Validate encryption implementation across all data',
        standard: 'PCI-DSS',
        category: 'encryption',
        frequency: 'monthly',
        status: 'not_run',
        findings: [],
        remediationSteps: [
          'Implement TLS 1.3 for all communications',
          'Encrypt sensitive data at rest',
          'Key management and rotation policies',
          'Regular encryption strength assessment'
        ]
      },
      {
        id: 'security_monitoring',
        name: 'Security Monitoring',
        description: 'Validate security monitoring and alerting systems',
        standard: 'NIST',
        category: 'monitoring',
        frequency: 'continuous',
        status: 'not_run',
        findings: [],
        remediationSteps: [
          'Implement comprehensive logging',
          'Set up real-time alerting',
          'Regular log review and analysis',
          'Security information and event management (SIEM)'
        ]
      },
      {
        id: 'incident_response_plan',
        name: 'Incident Response Plan',
        description: 'Validate incident response capabilities',
        standard: 'NIST',
        category: 'incident_response',
        frequency: 'quarterly',
        status: 'not_run',
        findings: [],
        remediationSteps: [
          'Develop and maintain incident response plan',
          'Conduct regular incident response drills',
          'Establish communication protocols',
          'Post-incident review and improvement process'
        ]
      }
    ];

    defaultChecks.forEach(check => this.complianceChecks.set(check.id, check));
  }

  /**
   * Initialize default security policies
   */
  private initializeDefaultSecurityPolicies(): void {
    const defaultPolicies: SecurityPolicy[] = [
      {
        id: 'password_policy',
        name: 'Password Security Policy',
        description: 'Enforce strong password requirements',
        category: 'password',
        enabled: true,
        enforcement: 'strict',
        rules: [
          {
            id: 'password_length',
            condition: 'password.length < 12',
            action: 'deny',
            parameters: { minLength: 12 },
            priority: 1
          },
          {
            id: 'password_complexity',
            condition: 'password does not contain uppercase, lowercase, number, and special character',
            action: 'deny',
            parameters: {},
            priority: 2
          }
        ]
      },
      {
        id: 'access_policy',
        name: 'Access Control Policy',
        description: 'Control system and data access',
        category: 'access',
        enabled: true,
        enforcement: 'strict',
        rules: [
          {
            id: 'session_timeout',
            condition: 'user.session.idle_time > 30_minutes',
            action: 'deny',
            parameters: { timeoutMinutes: 30 },
            priority: 1
          },
          {
            id: 'failed_login_attempts',
            condition: 'user.failed_login_attempts > 5',
            action: 'deny',
            parameters: { maxAttempts: 5, lockoutMinutes: 15 },
            priority: 2
          }
        ]
      },
      {
        id: 'data_policy',
        name: 'Data Protection Policy',
        description: 'Protect sensitive data handling',
        category: 'data',
        enabled: true,
        enforcement: 'strict',
        rules: [
          {
            id: 'data_classification',
            condition: 'data contains PII and not encrypted',
            action: 'alert',
            parameters: {},
            priority: 1
          },
          {
            id: 'data_retention',
            condition: 'data.age > retention_policy',
            action: 'audit',
            parameters: {},
            priority: 2
          }
        ]
      }
    ];

    defaultPolicies.forEach(policy => this.securityPolicies.set(policy.id, policy));
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): void {
    this.metrics = {
      totalEvents: 0,
      failedAuthentications: 0,
      suspiciousActivities: 0,
      dataAccessViolations: 0,
      complianceScore: 100,
      activeVulnerabilities: 0,
      encryptionCoverage: 0
    };
  }

  /**
   * Start security monitoring
   */
  public startSecurityMonitoring(): void {
    console.log('🔒 Starting security monitoring...');

    // Continuous audit logging
    this.auditInterval = setInterval(() => {
      this.performSecurityAudit();
    }, 60000); // Every minute

    // Compliance checks
    this.complianceInterval = setInterval(() => {
      this.runComplianceChecks();
    }, 3600000); // Every hour

    // Vulnerability scanning
    this.vulnerabilityScanInterval = setInterval(() => {
      this.performVulnerabilityScan();
    }, 86400000); // Daily

    this.emit('monitoring-started');
  }

  /**
   * Stop security monitoring
   */
  public stopSecurityMonitoring(): void {
    if (this.auditInterval) {
      clearInterval(this.auditInterval);
      this.auditInterval = null;
    }

    if (this.complianceInterval) {
      clearInterval(this.complianceInterval);
      this.complianceInterval = null;
    }

    if (this.vulnerabilityScanInterval) {
      clearInterval(this.vulnerabilityScanInterval);
      this.vulnerabilityScanInterval = null;
    }

    this.emit('monitoring-stopped');
  }

  /**
   * Log security event
   */
  public logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 10,000 events
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-10000);
    }

    // Update metrics
    this.updateSecurityMetrics(securityEvent);

    // Emit event for real-time monitoring
    this.emit('security-event', securityEvent);

    // Check for alerts
    this.checkSecurityAlerts(securityEvent);
  }

  /**
   * Update security metrics
   */
  private updateSecurityMetrics(event: SecurityEvent): void {
    this.metrics.totalEvents++;

    if (event.type === 'authentication' && event.result === 'failure') {
      this.metrics.failedAuthentications++;
    }

    if (event.severity === 'high' || event.severity === 'critical') {
      this.metrics.suspiciousActivities++;
    }

    if (event.type === 'data_access' && event.result === 'failure') {
      this.metrics.dataAccessViolations++;
    }
  }

  /**
   * Check for security alerts
   */
  private checkSecurityAlerts(event: SecurityEvent): void {
    // Check for brute force attacks
    if (event.type === 'authentication' && event.result === 'failure') {
      const recentFailures = this.securityEvents
        .filter(e => e.type === 'authentication' && e.result === 'failure' && e.user === event.user)
        .filter(e => (Date.now() - e.timestamp.getTime()) < 3600000) // Last hour
        .length;

      if (recentFailures >= 5) {
        this.emit('security-alert', {
          type: 'brute_force_attempt',
          severity: 'high',
          user: event.user,
          attempts: recentFailures,
          timeWindow: '1h'
        });
      }
    }

    // Check for unusual access patterns
    if (event.type === 'data_access' && event.severity === 'high') {
      this.emit('security-alert', {
        type: 'suspicious_data_access',
        severity: 'high',
        user: event.user,
        resource: event.resource,
        action: event.action
      });
    }
  }

  /**
   * Perform security audit
   */
  private async performSecurityAudit(): Promise<void> {
    try {
      // Audit user sessions
      await this.auditUserSessions();

      // Audit data access
      await this.auditDataAccess();

      // Audit system configuration
      await this.auditSystemConfiguration();

    } catch (error) {
      console.error('Security audit error:', error);
    }
  }

  /**
   * Audit user sessions
   */
  private async auditUserSessions(): Promise<void> {
    // In a real implementation, this would check active sessions
    // and log any anomalies
    const activeSessions = Math.floor(Math.random() * 100) + 50; // Simulate

    if (activeSessions > 200) { // Unusual number of sessions
      this.logSecurityEvent({
        type: 'anomaly',
        severity: 'medium',
        source: 'session_audit',
        action: 'detected_high_session_count',
        result: 'success',
        details: { activeSessions },
        complianceTags: ['access_control']
      });
    }
  }

  /**
   * Audit data access
   */
  private async auditDataAccess(): Promise<void> {
    // In a real implementation, this would check recent data access patterns
    const sensitiveDataAccess = Math.floor(Math.random() * 10);

    if (sensitiveDataAccess > 5) {
      this.logSecurityEvent({
        type: 'data_access',
        severity: 'medium',
        source: 'data_audit',
        action: 'bulk_sensitive_data_access',
        result: 'success',
        details: { accessCount: sensitiveDataAccess },
        complianceTags: ['data_protection', 'GDPR']
      });
    }
  }

  /**
   * Audit system configuration
   */
  private async auditSystemConfiguration(): Promise<void> {
    // In a real implementation, this would check system security settings
    const configIssues = Math.floor(Math.random() * 3);

    if (configIssues > 0) {
      this.logSecurityEvent({
        type: 'security_config',
        severity: 'low',
        source: 'config_audit',
        action: 'configuration_drift_detected',
        result: 'success',
        details: { issuesFound: configIssues },
        complianceTags: ['ISO27001']
      });
    }
  }

  /**
   * Run compliance checks
   */
  private async runComplianceChecks(): Promise<void> {
    for (const [id, check] of this.complianceChecks) {
      try {
        await this.runComplianceCheck(check);
      } catch (error) {
        console.error(`Compliance check ${id} failed:`, error);
      }
    }
  }

  /**
   * Run individual compliance check
   */
  private async runComplianceCheck(check: ComplianceCheck): Promise<void> {
    console.log(`Running compliance check: ${check.name}`);

    // Simulate compliance check execution
    const findings = await this.performComplianceCheck(check);

    check.lastRun = new Date();
    check.findings = findings;
    check.status = findings.some(f => f.severity === 'critical') ? 'failed' :
                   findings.some(f => f.severity === 'high') ? 'warning' : 'passed';

    this.complianceChecks.set(check.id, check);
    this.emit('compliance-check-completed', check);
  }

  /**
   * Perform compliance check
   */
  private async performComplianceCheck(check: ComplianceCheck): Promise<ComplianceFinding[]> {
    // In a real implementation, this would perform actual compliance checks
    // For now, we'll simulate findings
    const findings: ComplianceFinding[] = [];

    // Simulate random findings based on check type
    if (Math.random() > 0.7) { // 30% chance of findings
      findings.push({
        id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        severity: Math.random() > 0.8 ? 'high' : 'medium',
        title: `Compliance issue in ${check.name}`,
        description: `Automated check detected a potential compliance violation in ${check.category}`,
        evidence: 'Automated scan result',
        recommendation: check.remediationSteps[0] || 'Review and remediate the identified issue',
        status: 'open',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    return findings;
  }

  /**
   * Perform vulnerability scan
   */
  private async performVulnerabilityScan(): Promise<void> {
    console.log('🔍 Performing vulnerability scan...');

    const scan: VulnerabilityScan = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      target: 'production_system',
      scanner: 'automated_scanner',
      status: 'in_progress',
      vulnerabilities: [],
      summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
    };

    try {
      // Simulate vulnerability scanning
      scan.vulnerabilities = await this.simulateVulnerabilityScan();
      scan.summary = this.calculateVulnerabilitySummary(scan.vulnerabilities);
      scan.status = 'completed';

      this.vulnerabilityScans.push(scan);
      this.metrics.lastScanDate = scan.timestamp;
      this.metrics.activeVulnerabilities = scan.vulnerabilities.filter(v => v.status === 'open').length;

      this.emit('vulnerability-scan-completed', scan);

    } catch (error) {
      scan.status = 'failed';
      this.vulnerabilityScans.push(scan);
      console.error('Vulnerability scan failed:', error);
    }
  }

  /**
   * Simulate vulnerability scan
   */
  private async simulateVulnerabilityScan(): Promise<Vulnerability[]> {
    // Simulate finding some vulnerabilities
    const vulnerabilities: Vulnerability[] = [];

    if (Math.random() > 0.5) {
      vulnerabilities.push({
        id: 'CVE-2024-12345',
        cve: 'CVE-2024-12345',
        title: 'Remote Code Execution Vulnerability',
        description: 'Critical vulnerability allowing remote code execution',
        severity: 'critical',
        cvssScore: 9.8,
        affectedPackage: 'some-package',
        currentVersion: '1.0.0',
        fixedVersion: '1.0.1',
        references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-12345'],
        status: 'open'
      });
    }

    if (Math.random() > 0.3) {
      vulnerabilities.push({
        id: 'INT-001',
        title: 'Outdated SSL/TLS Configuration',
        description: 'System is using outdated SSL/TLS protocols',
        severity: 'high',
        affectedPackage: 'ssl_library',
        currentVersion: 'TLS 1.2',
        fixedVersion: 'TLS 1.3',
        references: [],
        status: 'open'
      });
    }

    return vulnerabilities;
  }

  /**
   * Calculate vulnerability summary
   */
  private calculateVulnerabilitySummary(vulnerabilities: Vulnerability[]): VulnerabilityScan['summary'] {
    const summary = { total: vulnerabilities.length, critical: 0, high: 0, medium: 0, low: 0 };

    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical': summary.critical++; break;
        case 'high': summary.high++; break;
        case 'medium': summary.medium++; break;
        case 'low': summary.low++; break;
      }
    });

    return summary;
  }

  /**
   * Get security metrics
   */
  public getSecurityMetrics(): SecurityMetrics {
    // Calculate compliance score
    const checks = Array.from(this.complianceChecks.values());
    const passedChecks = checks.filter(c => c.status === 'passed').length;
    this.metrics.complianceScore = checks.length > 0 ? (passedChecks / checks.length) * 100 : 100;

    return { ...this.metrics };
  }

  /**
   * Get security events
   */
  public getSecurityEvents(limit: number = 100, filter?: Partial<SecurityEvent>): SecurityEvent[] {
    let events = [...this.securityEvents].reverse(); // Most recent first

    if (filter) {
      events = events.filter(event =>
        Object.entries(filter).every(([key, value]) => event[key as keyof SecurityEvent] === value)
      );
    }

    return events.slice(0, limit);
  }

  /**
   * Get compliance checks
   */
  public getComplianceChecks(): ComplianceCheck[] {
    return Array.from(this.complianceChecks.values());
  }

  /**
   * Get security policies
   */
  public getSecurityPolicies(): SecurityPolicy[] {
    return Array.from(this.securityPolicies.values());
  }

  /**
   * Get vulnerability scans
   */
  public getVulnerabilityScans(limit: number = 10): VulnerabilityScan[] {
    return this.vulnerabilityScans.slice(-limit);
  }

  /**
   * Update compliance finding
   */
  public updateComplianceFinding(
    checkId: string,
    findingId: string,
    updates: Partial<ComplianceFinding>
  ): void {
    const check = this.complianceChecks.get(checkId);
    if (!check) return;

    const finding = check.findings.find(f => f.id === findingId);
    if (!finding) return;

    Object.assign(finding, updates);

    if (updates.status === 'resolved' && !finding.resolvedAt) {
      finding.resolvedAt = new Date();
    }

    this.complianceChecks.set(checkId, check);
    this.emit('compliance-finding-updated', { check, finding });
  }

  /**
   * Generate security report
   */
  public generateSecurityReport(): string {
    const metrics = this.getSecurityMetrics();
    const recentEvents = this.getSecurityEvents(20);
    const complianceChecks = this.getComplianceChecks();
    const recentScans = this.getVulnerabilityScans(5);

    let report = `# Sallie AI Security Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## Security Metrics\n\n`;
    report += `- **Total Security Events:** ${metrics.totalEvents}\n`;
    report += `- **Failed Authentications:** ${metrics.failedAuthentications}\n`;
    report += `- **Suspicious Activities:** ${metrics.suspiciousActivities}\n`;
    report += `- **Data Access Violations:** ${metrics.dataAccessViolations}\n`;
    report += `- **Compliance Score:** ${metrics.complianceScore.toFixed(1)}%\n`;
    report += `- **Active Vulnerabilities:** ${metrics.activeVulnerabilities}\n`;
    report += `- **Encryption Coverage:** ${metrics.encryptionCoverage.toFixed(1)}%\n`;
    if (metrics.lastScanDate) {
      report += `- **Last Vulnerability Scan:** ${metrics.lastScanDate.toISOString()}\n`;
    }
    report += '\n';

    report += `## Recent Security Events\n\n`;
    if (recentEvents.length === 0) {
      report += 'No security events recorded.\n\n';
    } else {
      recentEvents.forEach(event => {
        const severity = event.severity === 'critical' ? '🚨' :
                        event.severity === 'high' ? '⚠️' :
                        event.severity === 'medium' ? '⚡' : 'ℹ️';
        report += `${severity} **${event.type}** - ${event.action} (${event.result}) - ${event.timestamp.toISOString()}\n`;
        if (event.user) report += `   User: ${event.user}\n`;
        if (event.details && Object.keys(event.details).length > 0) {
          report += `   Details: ${JSON.stringify(event.details)}\n`;
        }
      });
      report += '\n';
    }

    report += `## Compliance Status\n\n`;
    const passedChecks = complianceChecks.filter(c => c.status === 'passed').length;
    const failedChecks = complianceChecks.filter(c => c.status === 'failed').length;
    const warningChecks = complianceChecks.filter(c => c.status === 'warning').length;

    report += `- **Total Checks:** ${complianceChecks.length}\n`;
    report += `- **Passed:** ${passedChecks} ✅\n`;
    report += `- **Failed:** ${failedChecks} ❌\n`;
    report += `- **Warnings:** ${warningChecks} ⚠️\n\n`;

    complianceChecks.forEach(check => {
      const status = check.status === 'passed' ? '✅' :
                    check.status === 'failed' ? '❌' :
                    check.status === 'warning' ? '⚠️' : '⏳';
      report += `${status} **${check.name}** (${check.standard}) - ${check.status}\n`;
      if (check.findings.length > 0) {
        report += `   Findings: ${check.findings.length}\n`;
      }
    });
    report += '\n';

    report += `## Vulnerability Scan Results\n\n`;
    if (recentScans.length === 0) {
      report += 'No vulnerability scans completed.\n\n';
    } else {
      recentScans.forEach(scan => {
        const status = scan.status === 'completed' ? '✅' : '❌';
        report += `${status} **${scan.timestamp.toISOString()}** - ${scan.summary.total} vulnerabilities\n`;
        report += `   Critical: ${scan.summary.critical}, High: ${scan.summary.high}, Medium: ${scan.summary.medium}, Low: ${scan.summary.low}\n`;
      });
      report += '\n';
    }

    return report;
  }
}

// Export singleton instance
export const securityManager = new SecurityAuditComplianceManager();

// Security utilities
export class SecurityUtils {
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  static encryptData(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  static decryptData(encryptedData: string, key: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encrypted = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 12) score += 25; else feedback.push('Use at least 12 characters');
    if (/[a-z]/.test(password)) score += 25; else feedback.push('Include lowercase letters');
    if (/[A-Z]/.test(password)) score += 25; else feedback.push('Include uppercase letters');
    if (/[0-9]/.test(password)) score += 15; else feedback.push('Include numbers');
    if (/[^A-Za-z0-9]/.test(password)) score += 10; else feedback.push('Include special characters');

    return {
      valid: score >= 75,
      score,
      feedback
    };
  }

  static sanitizeInput(input: string): string {
    // Basic input sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  static isValidIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  static detectSuspiciousActivity(events: SecurityEvent[], timeWindow: number = 3600000): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const now = Date.now();
    const recentEvents = events.filter(e => (now - e.timestamp.getTime()) < timeWindow);

    const reasons: string[] = [];

    // Check for rapid failed authentications
    const failedAuths = recentEvents.filter(e => e.type === 'authentication' && e.result === 'failure');
    if (failedAuths.length > 10) {
      reasons.push('High number of failed authentication attempts');
    }

    // Check for unusual access patterns
    const uniqueIPs = new Set(recentEvents.map(e => e.ip).filter(Boolean));
    if (uniqueIPs.size > 5) {
      reasons.push('Access from multiple IP addresses');
    }

    // Check for privilege escalation attempts
    const privilegeEscalations = recentEvents.filter(e => e.action.includes('escalate') || e.action.includes('sudo'));
    if (privilegeEscalations.length > 3) {
      reasons.push('Multiple privilege escalation attempts');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }
}

// Initialize security monitoring
securityManager.startSecurityMonitoring();
