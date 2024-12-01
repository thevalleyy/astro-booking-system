import React from 'react';
const config = require("../config.json");

const TimeTable = () => {
  // Function to generate times from 18:00 to 21:00, incrementing by 20 minutes
  const generateTimes = () => {
    const times = [];
    let currentTime = config.settings.start; // Starting at 18:00 on Jan 1, 2024
    const endTime = config.settings.end;

    while (currentTime <= endTime) {
      const timeString = `${currentTime}`;
      times.push(timeString);
      if(Number(currentTime[3]) == config.settings.inc_per_hour) {
        currentTime[1] = String(Number(currentTime[1])+1)
      }
      else {
        
      }
    }

    return times;
  };

  // Generate the times for the table headers
  const times = generateTimes();

  return (
    <div>
      <h1>Time Table</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {times.map((time) => (
              <th
                key={time}
                style={{
                  border: '1px solid #000',
                  padding: '8px',
                  textAlign: 'center',
                  backgroundColor: '#f2f2f2',
                }}
              >
                {time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: config.settings.slots_per_column }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {times.map((_, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    border: '1px solid #000',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  <button
                    style={{
                      padding: '5px 10px',
                      cursor: 'pointer',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      marginBottom: '5px',
                    }}
                  >
                    Button {rowIndex + 1}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeTable;
