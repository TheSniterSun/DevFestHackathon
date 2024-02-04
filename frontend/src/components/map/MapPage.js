function MapPage() {
    return (<>
        <br />

        <h1>Interactive Map</h1>

        <div className="map-container">
            <iframe id="map" src="http://127.0.0.1:5500/mapboxMap.html" style={{position: 'relative', top: '25px', width: "800px", height: "500px" }}></iframe>
        </div>

        </>
    );
}

export default MapPage;