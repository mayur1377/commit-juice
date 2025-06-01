import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Octokit } from '@octokit/rest';

export async function POST(req: Request) {
  try {
    console.log('POST /api/generate called');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session?.user || !session.accessToken) {
      console.error('Unauthorized: Missing user or access token', session);
      return NextResponse.json({ error: 'Unauthorized: Missing user or access token' }, { status: 401 });
    }

    const { message, grid, offset, startDate, endDate } = await req.json();
    console.log('Request body:', { message, grid, offset, startDate, endDate });
    if (!message || !grid) {
      console.error('Missing required fields', { message, grid });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    console.log('Parsed dates:', { startDateObj, endDateObj });
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      console.error('Invalid date format provided', { startDate, endDate });
      return NextResponse.json({ error: 'Invalid date format provided' }, { status: 400 });
    }

    console.log('Received dates:', {
      startDate: startDateObj.toISOString(),
      endDate: endDateObj.toISOString()
    });

    const githubUsername = (session.user as any).login;
    if (!githubUsername) {
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });
    }

    const octokit = new Octokit({ auth: session.accessToken });

    // Create repository with a sassy name
    const { data: createdRepo } = await octokit.repos.createForAuthenticatedUser({
      name: `REAL-DEVS-DONT-NEED-GREEN-DOTS-${Date.now()}`,
      private: true,
      auto_init: true,
      description: "Listen up, green dot enthusiasts, real learning happens when you're actually coding, not playing pixel art with your commit history. Stay focused, stay coding, and stop being a sheep! 🐑",
    });

    const defaultBranch = createdRepo.default_branch || 'main';

    // Wait for GitHub to propagate the new repo
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
    
    // Create workflow content
    const workflowContent = `name: Generate Contributions

on:
  repository_dispatch:
    types: [generate_contributions]

jobs:
  generate:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Configure Git
        run: |
          git config --global user.name "\${{ github.event.client_payload.username }}"
          git config --global user.email "\${{ github.event.client_payload.username }}@users.noreply.github.com"

      - name: Generate Commits
        env:
          GRID: \${{ toJSON(github.event.client_payload.grid) }}
          MESSAGE: \${{ github.event.client_payload.message }}
          OFFSET: \${{ github.event.client_payload.offset }}
          USERNAME: \${{ github.event.client_payload.username }}
          START_DATE: \${{ github.event.client_payload.startDate }}
          END_DATE: \${{ github.event.client_payload.endDate }}

        run: |
          # Install Node.js
          curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
          sudo apt-get install -y nodejs

          # Create script directory
          mkdir -p /tmp/script
          cd /tmp/script

          # Create commit generation script
          cat > commit.js << 'EOF'
          const fs = require('fs');
          const { execSync } = require('child_process');

          const grid = JSON.parse(process.env.GRID);
          const message = process.env.MESSAGE;
          const offset = parseInt(process.env.OFFSET) || 0;
          const username = process.env.USERNAME;
          const startDateEnv = process.env.START_DATE;
          const endDateEnv = process.env.END_DATE;

          console.log('Starting commit generation...');
          console.log('Grid dimensions:', grid.length, 'x', grid[0]?.length);
          console.log('Received date environment variables:', {
            startDateEnv,
            endDateEnv
          });

          // Parse dates from environment variables
          let startDate = new Date(startDateEnv);
          let endDate = new Date(endDateEnv);

          // Validate dates
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Invalid dates provided:', { startDateEnv, endDateEnv });
            process.exit(1);
          }

          // Align startDate to previous Sunday to match GitHub UI
          const dayOfWeek = startDate.getUTCDay(); // 0 = Sunday
          startDate = new Date(Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate() - dayOfWeek
          ));
          endDate = new Date(Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate(),
            23, 59, 59, 999
          ));

          console.log('Date range (UTC, aligned to Sunday):', {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          });

          let commitCount = 0;
          // Fix: Loop over columns (weeks) first, then rows (days), to match UI orientation
          for (let col = 0; col < grid[0].length; col++) {
            for (let row = 0; row < grid.length; row++) {
              if (grid[row][col]) {
                const commitDate = new Date(startDate);
                const daysToAdd = (col * 7) + row;
                commitDate.setDate(startDate.getDate() + daysToAdd);
                
                // Skip if commit date is after end date
                if (commitDate > endDate) {
                  console.log('Skipping commit after end date:', commitDate.toISOString());
                  continue;
                }
                
                const dateStr = commitDate.toISOString();
                console.log('Generating commit for date: ' + dateStr + ' (row: ' + row + ', col: ' + col + ')');
                const commitMessage = 'Contribution for ' + message + ' - ' + dateStr;

                // Generate commits for each day
                for (let commitIndex = 0; commitIndex < 10; commitIndex++) {
                  // Write unique content for each commit to ensure there is always a change
                  const fileContent = 'if you use this to generate contributions you are ngmi\\nCommit: ' + (commitIndex + 1) + '\\nDate: ' + dateStr + '\\nRow: ' + row + '\\nCol: ' + col + '\\nMessage: ' + message + '\\nUnique: ' + Math.random();
                  fs.writeFileSync('contribution.txt', fileContent);
                  
                  // Add the file to git before committing
                  execSync('git add contribution.txt', {stdio: 'inherit'});
                  
                  // Use GIT_AUTHOR_DATE and GIT_COMMITTER_DATE to ensure correct date
                  execSync('GIT_AUTHOR_DATE="' + dateStr + '" GIT_COMMITTER_DATE="' + dateStr + '" git commit -m "' + commitMessage + ' (' + (commitIndex + 1) + '/10)" --author="' + username + ' <' + username + '@users.noreply.github.com>"', {stdio: 'inherit'});
                  commitCount++;
                }
              }
            }
          }
          
          console.log('Generated ' + commitCount + ' commits');
          EOF

          # Change to repository directory
          cd $GITHUB_WORKSPACE
          
          # Run the commit generation script
          node /tmp/script/commit.js
          
          # Push all commits
          git push origin ${defaultBranch}
`;
    
    // Create the workflow file
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: githubUsername,
        repo: createdRepo.name,
        path: '.github/workflows/generate.yml',
        message: 'Add contribution generation workflow',
        content: Buffer.from(workflowContent).toString('base64'),
        branch: defaultBranch,
      });
      console.log("Workflow file created successfully");
    } catch (workflowError) {
      console.error("Failed to create workflow file:", workflowError);
      throw new Error(`Failed to create workflow file: ${workflowError}`);
    }

    // Wait a moment before dispatching to ensure workflow is ready
    console.log("Waiting for workflow to be registered...");
    await new Promise(res => setTimeout(res, 3000));

    // Dispatch event to run the workflow
    console.log("Dispatching repository_dispatch event with dates:", {
      startDate: startDateObj.toISOString(),
      endDate: endDateObj.toISOString()
    });
    await octokit.repos.createDispatchEvent({
      owner: githubUsername,
      repo: createdRepo.name,
      event_type: 'generate_contributions',
      client_payload: {
        grid,
        message,
        offset,
        username: githubUsername,
        startDate,
        endDate,
      }
    });

    console.log("✅ Done generating contribution art");
    return NextResponse.json({ 
      success: true, 
      repoUrl: createdRepo.html_url,
      defaultBranch: defaultBranch,
      status: "Repository created and workflow triggered successfully!"
    });

  } catch (error: any) {
    console.error("❌ Error generating contributions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate contributions" },
      { status: 500 }
    );
  }
}
