//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import Grid from '@mui/material/Grid2'
import IndicatorWeather from './components/IndicatorWeather';
import TableWeather from './components/TableWeather';
import ControlWeather from './components/ControlWeather';
import LineChartWeather from './components/LineChartWeather';
import Item from './interface/Item';
{/*hooks */}

import { useEffect, useState } from 'react';
interface Indicator {
  title?: String;
  subtitle?: String;
  value?: String;
}

function App() {
  //const [count, setCount] = useState(0)

  {/* Variable de estado y función de actualización */}
  let [indicators, setIndicators] = useState<Indicator[]>([])
  let [owm, setOWM] = useState(localStorage.getItem("openWeatherMap"))
  const [items, setItems] = useState<Item[]>([]);

  {/* Hook: useEffect */}
  useEffect( ()=>{
    let request = async () => {
      
       {/* Referencia a las claves del LocalStorage: openWeatherMap y expiringTime */}
       let savedTextXML = localStorage.getItem("openWeatherMap") || "";
       let expiringTime = localStorage.getItem("expiringTime");

       {/* Obtenga la estampa de tiempo actual */}
       let nowTime = (new Date()).getTime();

       {/* Verifique si es que no existe la clave expiringTime o si la estampa de tiempo actual supera el tiempo de expiración */}
       if(expiringTime === null || nowTime > parseInt(expiringTime)) {
      
       {/* Request */}
       //let API_KEY = "OPENWEATHERMAP' API KEY"
       let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Guayaquil&mode=xml&appid=f925680375249901cb08ba7d26e99bc6`)
       let savedTextXML = await response.text();

       {/* Tiempo de expiración */}
       let hours = 0.01
       let delay = hours * 3600000
       let expiringTime = nowTime + delay


       {/* En el LocalStorage, almacene el texto en la clave openWeatherMap, estampa actual y estampa de tiempo de expiración */}
       localStorage.setItem("openWeatherMap", savedTextXML)
       localStorage.setItem("expiringTime", expiringTime.toString())
       localStorage.setItem("nowTime", nowTime.toString())

       {/* DateTime */}
       localStorage.setItem("expiringDateTime", new Date(expiringTime).toString())
       localStorage.setItem("nowDateTime", new Date(nowTime).toString())

       {/* Modificación de la variable de estado mediante la función de actualización */ }
       setOWM( savedTextXML )
      } 
      
      if( savedTextXML ){

       {/* XML Parser */}
       const parser = new DOMParser();
       const xml = parser.parseFromString(savedTextXML, "application/xml");

       {/* Arreglo para agregar los resultados */}

       let dataToIndicators : Indicator[] = new Array<Indicator>();

        {/* 
            Análisis, extracción y almacenamiento del contenido del XML 
            en el arreglo de resultados
        */}

        let name = xml.getElementsByTagName("name")[0].innerHTML || ""
        dataToIndicators.push({"title":"Location", "subtitle": "City", "value": name})

        let location = xml.getElementsByTagName("location")[1]

        let latitude = location.getAttribute("latitude") || ""
        dataToIndicators.push({ "title": "Location", "subtitle": "Latitude", "value": latitude })

        let longitude = location.getAttribute("longitude") || ""
        dataToIndicators.push({ "title": "Location", "subtitle": "Longitude", "value": longitude })

        let altitude = location.getAttribute("altitude") || ""
        dataToIndicators.push({ "title": "Location", "subtitle": "Altitude", "value": altitude })

        

        //console.log( dataToIndicators )
         {/* Modificación de la variable de estado mediante la función de actualización */}
         setIndicators( dataToIndicators )
        
         const dataToItems: Item[] = [];
      const time = Array.from(xml.getElementsByTagName('time')).slice(0, 6);

      time.forEach((timeNode) => {
        const from = timeNode.getAttribute('from') || '';
        const to = timeNode.getAttribute('to') || '';
        const precipitation = timeNode.getElementsByTagName('precipitation')[0]?.getAttribute('probability') || '';
        const humidity = timeNode.getElementsByTagName('humidity')[0]?.getAttribute('value') || '';
        const clouds = timeNode.getElementsByTagName('clouds')[0]?.getAttribute('all') || '';
        dataToItems.push({ dateStart: from, dateEnd: to, precipitation, humidity, clouds });
      });

      setItems(dataToItems);

      }
      
      
    }

    request();
  }, [owm] )

  let renderIndicators = () => {

    return indicators
      .map(
        (indicator, idx) => (
          <Grid key={idx} size={{ xs: 12, xl: 3 }}>
            <IndicatorWeather 
                title={indicator["title"]} 
                subtitle={indicator["subtitle"]} 
                value={indicator["value"]} />
          </Grid>
                )
      )
     
  }

  {/* JSX */}

  return (
    <>
      <Grid container spacing={5}>

{/* Indicadores */}
{/*<Grid size={{ xs: 12, xl: 3 }}> 
  <IndicatorWeather title={'Indicator 1'} subtitle={'Unidad 1'} value={"1.23"}/> 
</Grid>
<Grid size={{ xs: 12, xl: 3 }}> 
  <IndicatorWeather title={'Indicator 2'} subtitle={'Unidad 2'} value={"3.12"}/> 
</Grid>
<Grid size={{ xs: 12, xl: 3 }}> 
  <IndicatorWeather title={'Indicator 3'} subtitle={'Unidad 3'} value={"2.31"}/> 
</Grid>
<Grid size={{ xs: 12, xl: 3 }}> 
  <IndicatorWeather title={'Indicator 4'} subtitle={'Unidad 4'} value={"3.21"}/> 
</Grid>*/}

{renderIndicators()}

{/* Tabla */}
<Grid size={{ xs: 12, xl: 8 }}>
   {/* Grid Anidado */}
   <Grid container spacing={2}>
      <Grid size={{ xs: 12, xl: 3 }}>
        <ControlWeather/>
      </Grid>
      <Grid size={{ xs: 12, xl: 9 }}>
        <TableWeather itemsIn={items}/>
      </Grid>
    </Grid>
</Grid>

{/* Gráfico */}
<Grid size={{ xs: 12, xl: 4 }}>
  <LineChartWeather/>
</Grid>

</Grid>
    </>
  )
}

export default App
