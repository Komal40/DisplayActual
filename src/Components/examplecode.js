{stationData.stations &&
            Object.entries(stationData.stations).map(([line, stations], index) => (
              <div
                key={index}
                style={{
                  display:
                    activeButton == `${parseInt(line.split("L")[1])}` 
                    ? "block" : "none",
                }}
              >
                <div className="task_stations_container">
                  {stations.map((station, idx) => (
                    <div className="task_stations" key={idx}>
                      <div className="task_stations_left">
                        <h4>F01 L02 S02</h4>
                        <div className="task_stations_part">
                          <p>Part: IMF 001</p>
                        </div>
                        <div className="task_stations_part">
                          <p>Process: IMF 001</p>
                        </div>
                        <div className="task_stations_part">
                          <p>Employee:</p>
                        </div>
                      </div>

                      <div className="task_stations_right">
                        <input className="task_station_input" />
                        <div className="task_dropdown">
                          <select>
                            <option>Change</option>
                          </select>
                        </div>
                        <div className="task_dropdown">
                          <select>
                            <option>Change</option>
                          </select>
                        </div>{" "}
                        <div className="task_dropdown">
                          <select>
                            <option>Change</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))} 