class GitHubHeatmap {
  constructor(username, containerId, token = null) {
    this.username = username;
    this.container = document.getElementById(containerId);
    this.token = token;
    this.contributions = [];
  }

  async fetchContributions() {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
          repositories(first: 1, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: [OWNER], isFork: false) {
            nodes {
              owner { login }
              name
              pushedAt
            }
          }
          repositoriesContributedTo(first: 1, orderBy: {field: PUSHED_AT, direction: DESC}, contributionTypes: [COMMIT], includeUserRepositories: true) {
            nodes {
              owner { login }
              name
              pushedAt
            }
          }
        }
      }
    `;

    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ query: query, variables: { username: this.username } })
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('GitHub API Error:', data.errors);
        return null;
      }

      return {
        calendar: data.data.user.contributionsCollection.contributionCalendar,
        latestOwn: data.data.user.repositories.nodes[0],
        latestContrib: data.data.user.repositoriesContributedTo.nodes[0]
      };
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      return null;
    }
  }

  async render() {
    const data = await this.fetchContributions();
    
    if (!data) {
      this.container.innerHTML = '<p>Failed to load GitHub activity</p>';
      return;
    }

    const calendar = data.calendar;

    const ownDate = data.latestOwn ? new Date(data.latestOwn.pushedAt) : new Date(0);
    const contribDate = data.latestContrib ? new Date(data.latestContrib.pushedAt) : new Date(0);
    
    const latestRepo = ownDate > contribDate ? data.latestOwn : data.latestContrib;

    const repoName = latestRepo ? 
        `${latestRepo.owner.login}/${latestRepo.name}` : 
        '';
    const timeAgo = latestRepo ? this.getTimeAgo(latestRepo.pushedAt) : null;

    let maxCount = 0;
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        if (day.contributionCount > maxCount) maxCount = day.contributionCount;
      });
    });

    const heatmapHTML = `
      <div class="github-heatmap">
        <div class="heatmap-header">
          <span class="total-contributions">${calendar.totalContributions} contributions in the last year</span>
        </div>
        <div class="heatmap-grid">
          ${this.renderMonthLabels(calendar.weeks)}
          <div class="heatmap-weeks">
            ${calendar.weeks.map(week => this.renderWeek(week, maxCount)).join('')}
          </div>
        </div>
        <div class="heatmap-legend">
          <span>Less</span>
          <div class="legend-colors">
            <span class="legend-box" style="background-color: #ebedf0"></span>
            <span class="legend-box" style="background-color: rgb(146, 224, 162)"></span>
            <span class="legend-box" style="background-color: rgb(105, 220, 143)"></span>
            <span class="legend-box" style="background-color: rgb(77, 216, 115)"></span>
            <span class="legend-box" style="background-color: rgb(57, 211, 83)"></span>
          </div>
          <span>More</span>
        </div>
        ${latestRepo ? `
          <div class="latest-commit">
            <span class="pulse-dot"></span>
            <span class="commit-text">Pushed to <strong>${repoName}</strong> ${timeAgo}</span>
          </div>
        ` : ''}
      </div>
    `;

    this.container.innerHTML = heatmapHTML;
  }

  getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  }

  getColorIntensity(count, maxCount) {
    if (count === 0) return '#ebedf0'; 
    
    // Use square root to make lower values more visible
    const intensity = Math.min(Math.sqrt(count / maxCount), 1);
    
    const minIntensity = 0.4;     //min opacity for any contribution
    const adjustedIntensity = minIntensity + (intensity * (1 - minIntensity));
    
    const baseColor = { r: 57, g: 211, b: 83 };
    
    const r = Math.round(235 + (baseColor.r - 235) * adjustedIntensity);
    const g = Math.round(237 + (baseColor.g - 237) * adjustedIntensity);
    const b = Math.round(240 + (baseColor.b - 240) * adjustedIntensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  }


  async render() {
    const data = await this.fetchContributions();
    
    if (!data) {
      this.container.innerHTML = '<p>Failed to load GitHub activity</p>';
      return;
    }

    const calendar = data.calendar;
    const ownDate = data.latestOwn ? new Date(data.latestOwn.pushedAt) : new Date(0);
    const contribDate = data.latestContrib ? new Date(data.latestContrib.pushedAt) : new Date(0);
    const latestRepo = ownDate > contribDate ? data.latestOwn : data.latestContrib;
    const repoName = latestRepo.owner ? 
        `${latestRepo.owner.login}/${latestRepo.name}` : 
        latestRepo.name;
    const timeAgo = latestRepo ? this.getTimeAgo(latestRepo.pushedAt) : null;

    let maxCount = 0;
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        if (day.contributionCount > maxCount) {
          maxCount = day.contributionCount;
        }
      });
    });

    const heatmapHTML = `
      <div class="github-heatmap">
        <div class="heatmap-header">
          <span class="total-contributions">${calendar.totalContributions} contributions in the last year</span>
        </div>
        <div class="heatmap-grid">
          ${this.renderMonthLabels(calendar.weeks)}
          <div class="heatmap-weeks">
            ${calendar.weeks.map(week => this.renderWeek(week, maxCount)).join('')}
          </div>
        </div>
        <div class="heatmap-legend">
          <span>Less</span>
          <div class="legend-colors">
            <span class="legend-box" style="background-color: #ebedf0"></span>
            <span class="legend-box" style="background-color: rgb(146, 224, 162)"></span>
            <span class="legend-box" style="background-color: rgb(105, 220, 143)"></span>
            <span class="legend-box" style="background-color: rgb(77, 216, 115)"></span>
            <span class="legend-box" style="background-color: rgb(57, 211, 83)"></span>
          </div>
          <span>More</span>
        </div>
        ${latestRepo ? `
          <div class="latest-commit">
            <span class="pulse-dot"></span>
            <span class="commit-text">Pushed to <strong>${repoName}</strong> ${timeAgo}</span>
          </div>
        ` : ''}
      </div>
    `;

    this.container.innerHTML = heatmapHTML;
  }

  renderMonthLabels(weeks) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let monthLabels = '<div class="month-labels">';
    
    let currentMonth = -1;
    weeks.forEach((week, index) => {
      const date = new Date(week.contributionDays[0].date);
      const month = date.getMonth();
      
      if (month !== currentMonth && date.getDate() <= 7) {
        currentMonth = month;
        const position = index * 12; // Approximate position
        monthLabels += `<span style="left: ${position}px">${months[month]}</span>`;
      }
    });
    
    monthLabels += '</div>';
    return monthLabels;
  }

  renderWeek(week, maxCount) {
    const days = week.contributionDays.map(day => {
      const color = this.getColorIntensity(day.contributionCount, maxCount);
      const date = new Date(day.contributionCount).toLocaleDateString();
      
      return `
        <div class="contribution-day" 
             style="background-color: ${color}"
             title="${day.contributionCount} contributions on ${day.date}"
             data-count="${day.contributionCount}">
        </div>
      `;
    }).join('');

    return `<div class="week-column">${days}</div>`;
  }
}

