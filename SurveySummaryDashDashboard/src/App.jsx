import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Plot from 'react-plotly.js';
import { Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Box, Button, Select, MenuItem } from '@mui/material';

// Fetch available CSV files from manifest

function App() {
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [summaryText, setSummaryText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedViz, setSelectedViz] = useState('boxplot');

  // Fetch manifest on mount
  useEffect(() => {
    fetch('/data/data_manifest.json')
      .then(res => res.json())
      .then(files => {
        setCsvFiles(files);
        setSelectedFile(files[0] || '');
      })
      .catch(() => setCsvFiles([]));
  }, []);

  // Load CSV data when file changes
  useEffect(() => {
    if (!selectedFile) return;
    Papa.parse('/data/' + selectedFile, {
      header: true,
      download: true,
      complete: (results) => {
        setCsvData(results.data);
        setColumns(results.meta.fields || []);
      },
    });
    // Load summary text
    const [project, species] = selectedFile.replace('.csv', '').split('_');
    fetch(`/supplement/${project}_${species}.txt`)
      .then((res) => res.text())
      .then(setSummaryText)
      .catch(() => setSummaryText('No summary available.'));
  }, [selectedFile]);

  // Detect species and callType columns
  const speciesCol = columns.find((c) => c.toLowerCase().includes('species'));
  const callTypeCol = columns.find((c) => c.toLowerCase().includes('calltype'));
  const numericCols = columns.filter((c) => csvData.some(row => !isNaN(parseFloat(row[c]))));

  // Unique species and callTypes
  const speciesList = Array.from(new Set(csvData.map(row => row[speciesCol]).filter(Boolean)));
  const callTypeList = Array.from(new Set(csvData.map(row => row[callTypeCol]).filter(Boolean)));

  // User selections
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedCallType, setSelectedCallType] = useState('');
  const [selectedValueCol, setSelectedValueCol] = useState('');

  // Update selections when data changes
  useEffect(() => {
    setSelectedSpecies(speciesList[0] || '');
    setSelectedCallType(callTypeList[0] || '');
    setSelectedValueCol(numericCols[0] || '');
  }, [speciesCol, callTypeCol, csvData.length]);

  // Filtered data for plots
  const filteredData = csvData.filter(row =>
    (!selectedSpecies || row[speciesCol] === selectedSpecies) &&
    (!selectedCallType || row[callTypeCol] === selectedCallType)
  );

  // Box Plot data
  const boxPlotData = [
    {
      y: filteredData.map(row => parseFloat(row[selectedValueCol])).filter(v => !isNaN(v)),
      type: 'box',
      name: `${selectedSpecies} - ${selectedCallType}`,
      boxpoints: 'all',
      jitter: 0.5,
      pointpos: 0,
    },
  ];

  // Polar Plot data (placeholder: use angle and radius columns if available)
  const angleCol = columns.find((c) => c.toLowerCase().includes('angle'));
  const radiusCol = columns.find((c) => c.toLowerCase().includes('radius'));
  const polarAngles = filteredData.map(row => parseFloat(row[angleCol])).filter(v => !isNaN(v));
  const polarRadii = filteredData.map(row => parseFloat(row[radiusCol])).filter(v => !isNaN(v));
  const polarPlotData = [
    {
      type: 'scatterpolar',
      r: polarRadii.length ? polarRadii : [1, 2, 3],
      theta: polarAngles.length ? polarAngles : [0, 120, 240],
      mode: 'markers',
      marker: { size: 8 },
      name: `${selectedSpecies} - ${selectedCallType}`,
    },
  ];

  // Extract lat/lon for map
  const latCol = columns.find((c) => c.toLowerCase().includes('lat'));
  const lonCol = columns.find((c) => c.toLowerCase().includes('lon'));
  const points = csvData.filter(row => row[latCol] && row[lonCol]);

  // Map bounds (fit all points)
  const mapBounds = points.length
    ? points.map(row => [parseFloat(row[latCol]), parseFloat(row[lonCol])])
    : null;

  // Sidebar visualizations
  const visualizations = [
    { key: 'boxplot', label: 'Detection Box Plot' },
    { key: 'polar', label: 'Polar Detections' },
  ];

  // Helper to fit bounds dynamically
  function FitBounds({ bounds }) {
    const map = useMap();
    React.useEffect(() => {
      if (bounds && bounds.length > 1) {
        map.fitBounds(bounds, { padding: [20, 20] });
      } else if (bounds && bounds.length === 1) {
        map.setView(bounds[0], 10);
      }
    }, [bounds, map]);
    return null;
  }

  // Helper to assign colors to species
  const COLORS = [
    '#1976d2', '#d32f2f', '#388e3c', '#fbc02d', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#388e3c', '#f57c00'
  ];
  function getSpeciesColor(species) {
    if (!species) return COLORS[0];
    const idx = speciesList.indexOf(species);
    return COLORS[idx % COLORS.length];
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer variant="persistent" anchor="left" open={sidebarOpen}>
        <Toolbar />
        <Box sx={{ width: 240 }}>
          <List>
            {visualizations.map((viz) => (
              <ListItem component="button" key={viz.key} selected={selectedViz === viz.key} onClick={() => setSelectedViz(viz.key)}>
                <ListItemText primary={viz.label} />
              </ListItem>
            ))}
          </List>
          <Button onClick={() => setSidebarOpen(false)}>Hide Sidebar</Button>
        </Box>
      </Drawer>
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Animal Sound Survey Dashboard
            </Typography>
            <Select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              sx={{ color: 'white', background: 'rgba(0,0,0,0.2)', minWidth: 200 }}
            >
              {csvFiles.map((file) => (
                <MenuItem value={file} key={file}>{file}</MenuItem>
              ))}
            </Select>
          </Toolbar>
        </AppBar>
        {/* Summary Row */}
        <Box sx={{ display: 'flex', mt: 2, gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 2 }}>
            <Typography variant="subtitle1">
              Project: {selectedFile?.split('_')[0] || ''} | Species: {selectedFile?.split('_')[1]?.replace('.csv','') || ''}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
              {summaryText}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 300, height: 300 }}>
            {points.length > 0 ? (
              <MapContainer style={{ height: '100%', width: '100%' }} center={points[0] ? [parseFloat(points[0][latCol]), parseFloat(points[0][lonCol])] : [0,0]} zoom={7} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FitBounds bounds={mapBounds} />
                {points.map((row, i) => (
                  <CircleMarker
                    key={i}
                    center={[parseFloat(row[latCol]), parseFloat(row[lonCol])]}
                    radius={4}
                    pathOptions={{ color: getSpeciesColor(row[speciesCol]), fillColor: getSpeciesColor(row[speciesCol]), fillOpacity: 0.8 }}
                  >
                    <Popup>
                      {columns.map((col) => (
                        <div key={col}><b>{col}:</b> {row[col]}</div>
                      ))}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            ) : (
              <Box sx={{ color: 'gray', textAlign: 'center', pt: 10 }}>No valid points to display</Box>
            )}
          </Box>
          {/* Legend to the right of the map */}
          {speciesList.length > 1 && (
            <Box sx={{ minWidth: 120, ml: 2, background: 'rgba(255,255,255,0.9)', borderRadius: 1, p: 1, boxShadow: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Species Legend</Typography>
              {speciesList.map((sp, idx) => (
                <Box key={sp} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', background: getSpeciesColor(sp), border: '1px solid #888' }} />
                  <Typography variant="caption">{sp}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        {/* Visualization Area */}
        <Box sx={{ mt: 4 }}>
          {/* Dropdowns for species, callType, and value column */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {speciesCol && (
              <Select
                value={selectedSpecies}
                onChange={e => setSelectedSpecies(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {speciesList.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            )}
            {callTypeCol && (
              <Select
                value={selectedCallType}
                onChange={e => setSelectedCallType(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {callTypeList.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            )}
            {selectedViz === 'boxplot' && (
              <Select
                value={selectedValueCol}
                onChange={e => setSelectedValueCol(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {numericCols.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
              </Select>
            )}
          </Box>
          {selectedViz === 'boxplot' && (
            <Plot
              data={boxPlotData}
              layout={{
                title: `Detection Box Plot for ${selectedSpecies} - ${selectedCallType}`,
                yaxis: { title: selectedValueCol },
                boxmode: 'group',
                height: 400,
              }}
              style={{ width: '100%' }}
            />
          )}
          {selectedViz === 'polar' && (
            <Plot
              data={polarPlotData}
              layout={{
                title: `Polar Detections for ${selectedSpecies} - ${selectedCallType}`,
                polar: { radialaxis: { visible: true } },
                height: 400,
              }}
              style={{ width: '100%' }}
            />
          )}
        </Box>
        {/* Show sidebar button if hidden */}
        {!sidebarOpen && (
          <Button onClick={() => setSidebarOpen(true)} sx={{ position: 'fixed', left: 0, top: 64 }}>Show Sidebar</Button>
        )}
        {/* Instructions for data placement */}
        <Box sx={{ mt: 4, color: 'gray' }}>
          <Typography variant="caption">
            Place your CSV files in <b>public/data/</b> and summary text files in <b>public/supplement/</b>.<br />
            Example: <b>public/data/ADRIFT_All.csv</b>, <b>public/supplement/ADRIFT_All.txt</b>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
