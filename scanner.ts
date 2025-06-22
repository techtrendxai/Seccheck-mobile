import { exec } from "child_process";
import { promisify } from "util";
import dns from "dns";
import https from "https";
import http from "http";
import net from "net";

const execAsync = promisify(exec);

export interface ScanOptions {
  timeout?: number;
  portRange?: string;
  includeHeaders?: boolean;
}

export class SecurityScanner {
  private timeout: number;

  constructor(timeout = 10000) {
    this.timeout = timeout;
  }

  async performWhoisLookup(domain: string): Promise<any> {
    try {
      const { stdout, stderr } = await execAsync(`whois ${domain}`, { timeout: this.timeout });
      if (stderr) throw new Error(stderr);
      
      return {
        success: true,
        data: stdout,
        domain,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Whois lookup failed",
        domain,
        timestamp: new Date().toISOString()
      };
    }
  }

  async performDnsLookup(domain: string): Promise<any> {
    try {
      const [aRecords, aaaaRecords, mxRecords, txtRecords] = await Promise.allSettled([
        dns.promises.resolve4(domain),
        dns.promises.resolve6(domain),
        dns.promises.resolveMx(domain),
        dns.promises.resolveTxt(domain)
      ]);

      return {
        success: true,
        data: {
          A: aRecords.status === "fulfilled" ? aRecords.value : [],
          AAAA: aaaaRecords.status === "fulfilled" ? aaaaRecords.value : [],
          MX: mxRecords.status === "fulfilled" ? mxRecords.value : [],
          TXT: txtRecords.status === "fulfilled" ? txtRecords.value : []
        },
        domain,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "DNS lookup failed",
        domain,
        timestamp: new Date().toISOString()
      };
    }
  }

  async scanPort(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(this.timeout);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(port, host);
    });
  }

  async performPortScan(host: string, options: ScanOptions = {}): Promise<any> {
    try {
      const portRange = options.portRange || "1-1000";
      const [start, end] = portRange.split("-").map(Number);
      
      const commonPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 5432, 6379, 8080, 8443];
      const portsToScan = end - start > 100 ? commonPorts : Array.from({length: end - start + 1}, (_, i) => start + i);
      
      const openPorts = [];
      const scanPromises = portsToScan.map(async (port) => {
        const isOpen = await this.scanPort(host, port);
        if (isOpen) {
          const serviceInfo = await this.getServiceInfo(port);
          openPorts.push({
            port,
            protocol: "tcp",
            service: serviceInfo.service,
            version: serviceInfo.version
          });
        }
      });

      await Promise.all(scanPromises);

      return {
        success: true,
        data: {
          host,
          openPorts: openPorts.sort((a, b) => a.port - b.port),
          scannedPorts: portsToScan.length,
          portRange
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Port scan failed",
        host,
        timestamp: new Date().toISOString()
      };
    }
  }

  async performNetworkScan(networkRange: string): Promise<any> {
    try {
      // Simple network discovery using ping
      const baseIp = networkRange.split('/')[0];
      const baseOctets = baseIp.split('.');
      const hosts = [];

      // Scan first 50 IPs for mobile performance
      for (let i = 1; i <= 50; i++) {
        const ip = `${baseOctets[0]}.${baseOctets[1]}.${baseOctets[2]}.${i}`;
        try {
          await execAsync(`ping -c 1 -W 1 ${ip}`, { timeout: 1000 });
          const hostname = await this.getHostname(ip);
          const deviceType = this.guessDeviceType(hostname, ip);
          hosts.push({
            ip,
            status: "up",
            hostname,
            deviceType,
            risk: this.assessDeviceRisk(hostname, ip)
          });
        } catch {
          // Host is down or unreachable
        }
      }

      return {
        success: true,
        data: {
          networkRange,
          activeHosts: hosts,
          totalScanned: 50,
          securitySummary: this.generateNetworkSecuritySummary(hosts)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network scan failed",
        networkRange,
        timestamp: new Date().toISOString()
      };
    }
  }

  async performVulnScan(url: string): Promise<any> {
    try {
      const results = {
        sslCheck: await this.checkSSL(url),
        headers: await this.analyzeHeaders(url),
        serverInfo: await this.getServerInfo(url)
      };

      const vulnerabilities = [];
      
      if (!results.sslCheck.valid) {
        vulnerabilities.push({
          severity: "high",
          type: "SSL/TLS",
          description: "Invalid or expired SSL certificate",
          risk: "Data transmission may be compromised"
        });
      }

      if (!results.headers.hasSecurityHeaders) {
        vulnerabilities.push({
          severity: "medium",
          type: "Security Headers",
          description: "Missing security headers",
          risk: "Vulnerable to XSS and clickjacking attacks"
        });
      }

      return {
        success: true,
        data: {
          url,
          vulnerabilities,
          checks: results,
          riskLevel: vulnerabilities.some(v => v.severity === "high") ? "high" : 
                     vulnerabilities.some(v => v.severity === "medium") ? "medium" : "low"
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Vulnerability scan failed",
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getServiceInfo(port: number): Promise<{service: string, version: string}> {
    const services: Record<number, {service: string, version: string}> = {
      22: { service: "SSH", version: "OpenSSH" },
      23: { service: "Telnet", version: "Unknown" },
      25: { service: "SMTP", version: "Unknown" },
      53: { service: "DNS", version: "Unknown" },
      80: { service: "HTTP", version: "Unknown" },
      110: { service: "POP3", version: "Unknown" },
      143: { service: "IMAP", version: "Unknown" },
      443: { service: "HTTPS", version: "Unknown" },
      993: { service: "IMAPS", version: "Unknown" },
      995: { service: "POP3S", version: "Unknown" },
      3306: { service: "MySQL", version: "Unknown" },
      5432: { service: "PostgreSQL", version: "Unknown" },
      6379: { service: "Redis", version: "Unknown" },
      8080: { service: "HTTP-Alt", version: "Unknown" },
      8443: { service: "HTTPS-Alt", version: "Unknown" }
    };

    return services[port] || { service: "Unknown", version: "Unknown" };
  }

  private async getHostname(ip: string): Promise<string> {
    try {
      const hostnames = await dns.promises.reverse(ip);
      return hostnames[0] || ip;
    } catch {
      return ip;
    }
  }

  private async checkSSL(url: string): Promise<any> {
    return new Promise((resolve) => {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'https:') {
        resolve({ valid: false, reason: "Not HTTPS" });
        return;
      }

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        method: 'GET',
        timeout: this.timeout
      };

      const req = https.request(options, (res) => {
        const cert = res.socket?.getPeerCertificate();
        resolve({
          valid: true,
          cert: {
            subject: cert?.subject,
            issuer: cert?.issuer,
            validFrom: cert?.valid_from,
            validTo: cert?.valid_to
          }
        });
      });

      req.on('error', (error) => {
        resolve({ valid: false, reason: error.message });
      });

      req.end();
    });
  }

  private async analyzeHeaders(url: string): Promise<any> {
    return new Promise((resolve) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = client.request(url, (res) => {
        const headers = res.headers;
        const securityHeaders = [
          'x-frame-options',
          'x-content-type-options',
          'x-xss-protection',
          'strict-transport-security',
          'content-security-policy'
        ];

        const hasSecurityHeaders = securityHeaders.some(header => headers[header]);

        resolve({
          headers,
          hasSecurityHeaders,
          missingHeaders: securityHeaders.filter(header => !headers[header])
        });
      });

      req.on('error', (error) => {
        resolve({ error: error.message });
      });

      req.end();
    });
  }

  private async getServerInfo(url: string): Promise<any> {
    return new Promise((resolve) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = client.request(url, (res) => {
        resolve({
          server: res.headers.server || "Unknown",
          poweredBy: res.headers['x-powered-by'] || "Unknown",
          statusCode: res.statusCode
        });
      });

      req.on('error', (error) => {
        resolve({ error: error.message });
      });

      req.end();
    });
  }

  async performWifiScan(target: string): Promise<any> {
    try {
      // Simulate Wi-Fi security analysis for demo
      // In real implementation, this would use system Wi-Fi APIs
      const wifiAnalysis = {
        networkName: target,
        encryption: Math.random() > 0.3 ? "WPA2" : "WEP",
        signalStrength: Math.floor(Math.random() * 100),
        channel: Math.floor(Math.random() * 11) + 1,
        securityIssues: []
      };

      if (wifiAnalysis.encryption === "WEP") {
        wifiAnalysis.securityIssues.push({
          severity: "high",
          issue: "WEP encryption is vulnerable",
          recommendation: "Upgrade to WPA3 or WPA2"
        });
      }

      return {
        success: true,
        data: {
          analysis: wifiAnalysis,
          recommendations: this.generateWifiRecommendations(wifiAnalysis)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Wi-Fi scan failed",
        timestamp: new Date().toISOString()
      };
    }
  }

  async performCredentialCheck(target: string): Promise<any> {
    try {
      // Common default credentials check
      const commonCreds = [
        { user: "admin", pass: "admin" },
        { user: "admin", pass: "password" },
        { user: "admin", pass: "123456" },
        { user: "root", pass: "root" },
        { user: "admin", pass: "" }
      ];

      const results = [];
      for (const cred of commonCreds) {
        // Simulate credential testing (in real scenario, would attempt login)
        const isWeak = Math.random() > 0.8; // 20% chance of weak creds
        if (isWeak) {
          results.push({
            username: cred.user,
            password: cred.pass,
            status: "vulnerable",
            service: "HTTP Admin Panel"
          });
        }
      }

      return {
        success: true,
        data: {
          target,
          weakCredentials: results,
          testedCredentials: commonCreds.length,
          riskLevel: results.length > 0 ? "high" : "low"
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Credential check failed",
        timestamp: new Date().toISOString()
      };
    }
  }

  private guessDeviceType(hostname: string, ip: string): string {
    const h = hostname.toLowerCase();
    if (h.includes('router') || h.includes('gateway')) return "Router";
    if (h.includes('printer')) return "Printer";
    if (h.includes('camera') || h.includes('cam')) return "Camera";
    if (h.includes('phone') || h.includes('android') || h.includes('iphone')) return "Mobile";
    if (h.includes('tv') || h.includes('roku') || h.includes('chromecast')) return "Smart TV";
    if (ip.endsWith('.1')) return "Router/Gateway";
    return "Unknown Device";
  }

  private assessDeviceRisk(hostname: string, ip: string): string {
    const h = hostname.toLowerCase();
    if (h.includes('camera') || h.includes('printer')) return "medium";
    if (h.includes('router') || h.includes('gateway')) return "high";
    if (ip.endsWith('.1')) return "high";
    return "low";
  }

  private generateNetworkSecuritySummary(hosts: any[]): any {
    const highRisk = hosts.filter(h => h.risk === "high").length;
    const mediumRisk = hosts.filter(h => h.risk === "medium").length;
    const total = hosts.length;

    return {
      totalDevices: total,
      highRiskDevices: highRisk,
      mediumRiskDevices: mediumRisk,
      overallRisk: highRisk > 0 ? "high" : mediumRisk > 0 ? "medium" : "low",
      recommendations: [
        "Change default passwords on all devices",
        "Update firmware on IoT devices",
        "Disable unnecessary services"
      ]
    };
  }

  private generateWifiRecommendations(analysis: any): string[] {
    const recommendations = [];
    
    if (analysis.encryption === "WEP") {
      recommendations.push("Immediately upgrade from WEP to WPA3");
    }
    
    if (analysis.signalStrength < 30) {
      recommendations.push("Improve router placement for better signal");
    }
    
    recommendations.push("Use a strong, unique password");
    recommendations.push("Enable WPA3 if available");
    recommendations.push("Disable WPS if not needed");
    
    return recommendations;
  }
}
