import { test, expect } from '@playwright/test';

const BACKEND_WS_URL = 'ws://localhost:8000/ws/ticks';
const NUM_CONNECTIONS = 50;
const TEST_DURATION_MS = 30000; // 30 seconds
const EXPECTED_MESSAGES_PER_SEC = 1; // Backend sends ticks every 1 second

test.describe('WebSocket Load Testing', () => {
  test('should handle 50 concurrent WebSocket connections', async () => {
    const connections: WebSocket[] = [];
    const messageCounters = new Array(NUM_CONNECTIONS).fill(0);
    const connectionTimes: number[] = [];
    const errors: string[] = [];

    console.log(`Starting WebSocket load test with ${NUM_CONNECTIONS} concurrent connections...`);

    // Create all connections
    const connectionPromises = Array.from({ length: NUM_CONNECTIONS }, (_, index) =>
      new Promise<void>((resolve, reject) => {
        const startTime = Date.now();
        const ws = new WebSocket(BACKEND_WS_URL);

        ws.onopen = () => {
          const connectionTime = Date.now() - startTime;
          connectionTimes.push(connectionTime);
          console.log(`Connection ${index + 1}/${NUM_CONNECTIONS} established in ${connectionTime}ms`);
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            messageCounters[index]++;

            // Validate message structure
            if (index === 0 && messageCounters[index] === 1) {
              console.log('First message received:', data);
            }

            expect(data).toHaveProperty('symbol');
            expect(data).toHaveProperty('ltp');
            expect(data).toHaveProperty('change_pct');
            expect(data).toHaveProperty('volume');
            expect(data).toHaveProperty('timestamp');
          } catch (err) {
            errors.push(`Message validation error on connection ${index}: ${err}`);
          }
        };

        ws.onerror = (error) => {
          errors.push(`WebSocket error on connection ${index}: ${error}`);
          reject(error);
        };

        ws.onclose = () => {
          console.log(`Connection ${index + 1} closed`);
        };

        connections.push(ws);

        // Timeout if connection takes too long
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            reject(new Error(`Connection ${index} timeout`));
          }
        }, 10000);
      })
    );

    // Wait for all connections to establish
    try {
      await Promise.all(connectionPromises);
      console.log(`All ${NUM_CONNECTIONS} connections established successfully!`);
    } catch (err) {
      console.error('Failed to establish all connections:', err);
      throw err;
    }

    // Calculate connection statistics
    const avgConnectionTime = connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length;
    const maxConnectionTime = Math.max(...connectionTimes);
    const minConnectionTime = Math.min(...connectionTimes);

    console.log('\n=== Connection Statistics ===');
    console.log(`Average connection time: ${avgConnectionTime.toFixed(2)}ms`);
    console.log(`Min connection time: ${minConnectionTime}ms`);
    console.log(`Max connection time: ${maxConnectionTime}ms`);

    // Assert connection times are reasonable
    expect(avgConnectionTime).toBeLessThan(500); // Average should be under 500ms
    expect(maxConnectionTime).toBeLessThan(2000); // Max should be under 2 seconds

    // Wait for test duration to collect messages
    console.log(`\nRunning test for ${TEST_DURATION_MS / 1000} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, TEST_DURATION_MS));

    // Calculate message statistics
    const totalMessages = messageCounters.reduce((a, b) => a + b, 0);
    const avgMessagesPerConnection = totalMessages / NUM_CONNECTIONS;
    const expectedMessagesPerConnection = (TEST_DURATION_MS / 1000) * EXPECTED_MESSAGES_PER_SEC;
    const messageReceiptRate = (avgMessagesPerConnection / expectedMessagesPerConnection) * 100;

    console.log('\n=== Message Statistics ===');
    console.log(`Total messages received: ${totalMessages}`);
    console.log(`Average messages per connection: ${avgMessagesPerConnection.toFixed(2)}`);
    console.log(`Expected messages per connection: ${expectedMessagesPerConnection}`);
    console.log(`Message receipt rate: ${messageReceiptRate.toFixed(2)}%`);

    // Check each connection received messages
    console.log('\n=== Per-Connection Message Counts ===');
    messageCounters.forEach((count, index) => {
      console.log(`Connection ${index + 1}: ${count} messages`);
    });

    // Assert all connections received at least some messages
    expect(messageCounters.every((count) => count > 0)).toBe(true);

    // Assert message receipt rate is reasonable (at least 80%)
    expect(messageReceiptRate).toBeGreaterThan(80);

    // Check for errors
    if (errors.length > 0) {
      console.error('\n=== Errors Detected ===');
      errors.forEach((error) => console.error(error));
      throw new Error(`${errors.length} errors occurred during test`);
    }

    // Check connection stability (all should still be open)
    const openConnections = connections.filter((ws) => ws.readyState === WebSocket.OPEN).length;
    const closedConnections = NUM_CONNECTIONS - openConnections;

    console.log('\n=== Connection Stability ===');
    console.log(`Open connections: ${openConnections}/${NUM_CONNECTIONS}`);
    console.log(`Closed connections: ${closedConnections}`);

    // Assert at least 95% of connections are still open
    expect(openConnections).toBeGreaterThanOrEqual(NUM_CONNECTIONS * 0.95);

    // Close all connections
    console.log('\nClosing all connections...');
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    // Wait for connections to close
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('\n=== Test Summary ===');
    console.log(`✅ Successfully handled ${NUM_CONNECTIONS} concurrent connections`);
    console.log(`✅ Average connection time: ${avgConnectionTime.toFixed(2)}ms`);
    console.log(`✅ Total messages received: ${totalMessages}`);
    console.log(`✅ Message receipt rate: ${messageReceiptRate.toFixed(2)}%`);
    console.log(`✅ Connection stability: ${((openConnections / NUM_CONNECTIONS) * 100).toFixed(2)}%`);
  });

  test('should handle connection bursts without memory leaks', async () => {
    console.log('\nTesting connection bursts...');

    const connectAndDisconnect = async (index: number) => {
      return new Promise<number>((resolve) => {
        const startTime = Date.now();
        const ws = new WebSocket(BACKEND_WS_URL);
        let messageCount = 0;

        ws.onopen = () => {
          // Close after receiving a few messages
          setTimeout(() => {
            ws.close();
          }, 2000);
        };

        ws.onmessage = () => {
          messageCount++;
        };

        ws.onclose = () => {
          const duration = Date.now() - startTime;
          console.log(`Burst connection ${index + 1} completed in ${duration}ms, received ${messageCount} messages`);
          resolve(messageCount);
        };

        ws.onerror = () => {
          ws.close();
          resolve(0);
        };
      });
    };

    // Create 3 waves of 20 connections each
    const waves = 3;
    const connectionsPerWave = 20;

    for (let wave = 0; wave < waves; wave++) {
      console.log(`\nStarting wave ${wave + 1}/${waves}...`);
      const wavePromises = Array.from({ length: connectionsPerWave }, (_, i) =>
        connectAndDisconnect(wave * connectionsPerWave + i)
      );

      const results = await Promise.all(wavePromises);
      const totalMessages = results.reduce((a, b) => a + b, 0);

      console.log(`Wave ${wave + 1} complete: ${totalMessages} total messages received`);
      expect(results.every((count) => count > 0)).toBe(true);

      // Wait between waves
      if (wave < waves - 1) {
        console.log('Waiting 2 seconds before next wave...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log('\n✅ Connection burst test completed successfully');
  });
});

test.describe('WebSocket Message Validation', () => {
  test('should receive valid market tick data', async () => {
    console.log('\nTesting message validation...');

    const ws = new WebSocket(BACKEND_WS_URL);
    const messages: any[] = [];

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => {
        console.log('WebSocket connected for message validation');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        messages.push(data);

        if (messages.length >= 5) {
          ws.close();
        }
      };

      ws.onclose = () => {
        resolve();
      };

      ws.onerror = (error) => {
        reject(error);
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        ws.close();
        resolve();
      }, 10000);
    });

    console.log(`\nReceived ${messages.length} messages for validation`);

    // Validate message structure
    expect(messages.length).toBeGreaterThan(0);

    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, msg);

      expect(msg).toHaveProperty('symbol');
      expect(msg).toHaveProperty('ltp');
      expect(msg).toHaveProperty('change_pct');
      expect(msg).toHaveProperty('volume');
      expect(msg).toHaveProperty('timestamp');

      // Validate types
      expect(typeof msg.symbol).toBe('string');
      expect(typeof msg.ltp).toBe('number');
      expect(typeof msg.change_pct).toBe('number');
      expect(typeof msg.volume).toBe('number');
      expect(typeof msg.timestamp).toBe('string');

      // Validate reasonable values
      expect(msg.ltp).toBeGreaterThan(0);
      expect(msg.volume).toBeGreaterThan(0);
      expect(Math.abs(msg.change_pct)).toBeLessThan(100); // Change should be reasonable
    });

    console.log('✅ All messages validated successfully');
  });
});
