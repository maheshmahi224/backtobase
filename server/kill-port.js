import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const killPort = async (port) => {
  try {
    console.log(`🔍 Checking for processes on port ${port}...`);
    
    // Find process using the port
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (stdout) {
      // Extract PID (last column)
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          pids.add(pid);
        }
      });
      
      // Kill all processes
      for (const pid of pids) {
        try {
          await execAsync(`taskkill /PID ${pid} /F`);
          console.log(`✅ Killed process ${pid} on port ${port}`);
        } catch (error) {
          // Process might have already been killed
        }
      }
      
      // Wait a moment for port to be released
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`✅ Port ${port} is already free`);
    }
  } catch (error) {
    // Port is likely free
    console.log(`✅ Port ${port} is free`);
  }
};

// Kill port 5000
killPort(5000).then(() => {
  console.log('🚀 Port cleared, starting server...\n');
  process.exit(0);
});
