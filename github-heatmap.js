
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
        }
      }
    `;

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token is provided
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          query: query,
          variables: { username: this.username }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('GitHub API Error:', data.errors);
        return null;
      }

      return data.data.user.contributionsCollection.contributionCalendar;
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      return null;
    }
  }

  // Get color intensity based on contribution count
  getColorIntensity(count, maxCount) {
    if (count === 0) return '#ebedf0'; // Light gray for no contributions
    
    // Calculate intensity percentage (0 to 1)
    const intensity = Math.min(count / maxCount, 1);
    
    // Single green shade with varying opacity/brightness
    // Base green color: #39d353
    const baseColor = { r: 57, g: 211, b: 83 };
    
    // Interpolate between light green and full green
    const r = Math.round(235 + (baseColor.r - 235) * intensity);
    const g = Math.round(237 + (baseColor.g - 237) * intensity);
    const b = Math.round(240 + (baseColor.b - 240) * intensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Render the heatmap
  async render() {
    const calendar = await this.fetchContributions();
    
    if (!calendar) {
      this.container.innerHTML = '<p>Failed to load GitHub activity</p>';
      return;
    }

    // Find max contribution count for color scaling
    let maxCount = 0;
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        if (day.contributionCount > maxCount) {
          maxCount = day.contributionCount;
        }
      });
    });

    // Create heatmap HTML
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
            <span class="legend-box" style="background-color: rgb(177, 227, 186)"></span>
            <span class="legend-box" style="background-color: rgb(134, 224, 161)"></span>
            <span class="legend-box" style="background-color: rgb(91, 219, 137)"></span>
            <span class="legend-box" style="background-color: rgb(57, 211, 83)"></span>
          </div>
          <span>More</span>
        </div>
      </div>
    `;

    this.container.innerHTML = heatmapHTML;
  }

  // Render month labels
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

  // Render a week column
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
