import { ZBClient } from 'zeebe-node';
import { logger } from '../utils/logger';

class ZeebeService {
  private client: ZBClient | null = null;
  private readonly gatewayAddress: string;

  constructor() {
    this.gatewayAddress = process.env.ZEEBE_ADDRESS || 'localhost:26500';
  }

  /**
   * Get or create Zeebe client (lazy initialization)
   */
  private getClient(): ZBClient {
    if (!this.client) {
      this.client = new ZBClient(this.gatewayAddress, {
        usePlaintext: true,
      });
      logger.info(`Zeebe client connected to ${this.gatewayAddress}`);
    }
    return this.client;
  }

  /**
   * Start a workflow process instance
   *
   * IMPORTANT: Only pass submissionId as reference!
   * All actual data stays in PostgreSQL (single source of truth)
   *
   * @param processId - BPMN process ID (e.g., 'leave-request-process')
   * @param submissionId - UUID of the submission in PostgreSQL
   * @param metadata - Minimal metadata for routing (no form data!)
   */
  async startProcess(
    processId: string,
    submissionId: string,
    metadata: {
      formSlug: string;
      submittedBy: string;
    }
  ): Promise<{ processInstanceKey: string }> {
    try {
      const client = this.getClient();

      // ONLY pass reference - no form data!
      const result = await client.createProcessInstance({
        bpmnProcessId: processId,
        variables: {
          submissionId: submissionId,
          formSlug: metadata.formSlug,
          submittedBy: metadata.submittedBy,
          submittedAt: new Date().toISOString(),
        },
      });

      logger.info(`Started process ${processId}, instance: ${result.processInstanceKey}, submission: ${submissionId}`);

      return {
        processInstanceKey: result.processInstanceKey.toString(),
      };
    } catch (error) {
      logger.error(`Failed to start process ${processId}:`, error);
      throw error;
    }
  }

  /**
   * Check if Zeebe is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.topology();
      return true;
    } catch (error) {
      logger.error('Zeebe health check failed:', error);
      return false;
    }
  }

  /**
   * Close the client connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      logger.info('Zeebe client closed');
    }
  }
}

export const zeebeService = new ZeebeService();
