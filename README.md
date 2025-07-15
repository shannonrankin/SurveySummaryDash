# Acoustic Summary Dashboard

An interactive dashboard for analyzing acoustic survey data with maps, spectrograms, and time-series visualizations. Built with React and designed for GitHub Pages deployment.

## Features

- **Interactive Map**: Visualize detection locations with color-coded species and pattern-coded call types
- **Audio Spectrogram**: Play and visualize audio files with WaveSurfer.js
- **Time Series Analysis**: Plot detections over time with hourly, daily, or monthly aggregation
- **Diurnal Patterns**: Polar plot showing 24-hour detection patterns
- **Collapsible Sidebar**: Easy navigation and dataset selection
- **Multi-dataset Support**: Switch between different acoustic survey datasets

## Data Format Requirements

### CSV Files
Place your CSV files in `public/data/` with the naming convention: `ProjectName_species.csv`

Required columns:
- `UTC` or `date`: DateTime in ISO format (e.g., "2023-01-15T14:30:00Z")
- `lat`: Latitude (decimal degrees)
- `lon`: Longitude (decimal degrees)
- `species`: Species identifier
- `calltype`: Call type identifier

Example CSV structure:
```csv
UTC,lat,lon,species,calltype
2023-01-15T14:30:00Z,45.123,-122.456,WHALE,ECHOLOCATION
2023-01-15T14:35:00Z,45.125,-122.458,WHALE,COMMUNICATION
```

### Summary Text Files
Place your summary files in `public/supplement/` with the naming convention: `ProjectName_species.txt`

Include information about:
- Project description
- Survey methodology
- Data collection period
- Species information
- Any relevant notes

### Audio Files
Place your audio files in `public/audio/` with the naming convention: `ProjectName_species.wav`

- Use WAV format for best compatibility
- Include a representative audio sample for the species
- File should be reasonably sized (< 10MB for web deployment)

## Setup Instructions

### 1. Clone and Install
```bash
git clone https://github.com/[your-username]/AcousticSummaryDashboard.git
cd AcousticSummaryDashboard
npm install
```

### 2. Add Your Data
1. Create your CSV file with the required columns
2. Place it in `public/data/` with format: `ProjectName_species.csv`
3. Create a summary text file and place it in `public/supplement/` with format: `ProjectName_species.txt`
4. Add your audio file to `public/audio/` with format: `ProjectName_species.wav`

### 3. Update Manifest
```bash
npm run generate-manifest
```

### 4. Test Locally
```bash
npm run dev
```

### 5. Deploy to GitHub Pages
```bash
npm run deploy
```

## Usage

### Dataset Selection
- Use the sidebar to select different datasets
- The dropdown shows all available datasets in the format "Project - Species"

### Map Visualization
- Points are colored by species
- Different call types are shown with different patterns (solid, dashed, dotted)
- Click on points to see detailed information
- Map automatically fits to show all data points

### Audio Playback
- Use the play/pause/stop controls to listen to audio samples
- Progress bar shows current playback position
- Spectrogram visualization shows frequency content over time

### Data Analysis
- **Detection Time Series**: Shows number of detections over time
  - Choose hourly, daily, or monthly aggregation
  - Filter by species and call type
- **Diurnal Pattern**: Polar plot showing 24-hour detection patterns
  - Useful for understanding daily activity cycles
  - Filter by species and call type

### Sidebar Controls
- **Dataset**: Select which dataset to analyze
- **Visualization Type**: Choose between time series or diurnal plots
- **Time Spacing**: For time series, choose aggregation level
- **Species**: Filter by specific species (if multiple present)
- **Call Type**: Filter by specific call type (if multiple present)

## Adding New Visualizations

The dashboard is designed to be extensible. To add new visualizations:

1. Add a new visualization option to the `visualizations` array in `src/App.jsx`
2. Create the corresponding data processing function
3. Add the Plot component with appropriate layout
4. Update the sidebar controls if needed

## Deployment

### GitHub Pages Setup
1. Update the `homepage` field in `package.json` with your GitHub Pages URL
2. Ensure your repository is public
3. Run `npm run deploy` to build and deploy
4. Enable GitHub Pages in your repository settings (Source: gh-pages branch)

### Custom Domain (Optional)
1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure your domain's DNS settings
3. Update the `homepage` field in `package.json`

## Troubleshooting

### Common Issues

**No datasets appear**
- Check that CSV files are in `public/data/`
- Ensure files follow the naming convention
- Run `npm run generate-manifest`

**Map not showing points**
- Verify lat/lon columns exist in CSV
- Check that coordinates are valid decimal degrees
- Ensure data is properly formatted

**Audio not playing**
- Check that WAV file exists in `public/audio/`
- Verify file naming matches CSV file
- Ensure file is not corrupted

**Visualizations not updating**
- Check browser console for errors
- Verify data format in CSV
- Ensure required columns are present

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the data format requirements
3. Open an issue on GitHub with detailed information about your problem

## Example Data

Sample files are included in the repository to demonstrate the format:
- `public/data/ADRIFT01_All.csv` - Example acoustic detection data
- `public/supplement/ADRIFT01_All.txt` - Example summary information
- `public/audio/ADRIFT01_All.wav` - Example audio file (if provided)
