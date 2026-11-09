// src/CharacterLoader.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';

function CharacterLoader() {
  const [pokemons, setPokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=40')
      .then(async (response) => {
        const results = response.data.results;
        
        const detailed = await Promise.all(
          results.map(async (item) => {
            try {
              const res = await axios.get(item.url);
              return {
                name: res.data.name,
                id: res.data.id,
                weight: (res.data.weight / 10).toFixed(1), // kg
                height: (res.data.height / 10).toFixed(1), // m
                image: res.data.sprites.front_default || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
                types: res.data.types.map(t => t.type.name),
              };
            } catch (err) {
              return null;
            }
          })
        );

        const validPokemons = detailed.filter(p => p !== null);
        // Ordenamos estrictamente alfabéticamente desde el inicio
        validPokemons.sort((a, b) => a.name.localeCompare(b.name));
        
        setPokemons(validPokemons);
        if (validPokemons.length > 0) setSelectedPokemon(validPokemons[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar la API:", error);
        setLoading(false);
      });
  }, []);

  // FILTRO MEJORADO: Normaliza texto, ignora mayúsculas/minúsculas y busca coincidencias exactas en el nombre
  const filteredPokemons = pokemons.filter((poke) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return poke.name.toLowerCase().includes(search);
  });

  return (
    <div style={{ backgroundColor: '#071207', minHeight: '100vh', color: '#00ff66', fontFamily: '"Courier New", Courier, monospace', padding: '20px' }}>
      <Container style={{ maxWidth: '1050px' }}>
        
        {/* Cabecera estilo Terminal */}
        <div style={{ border: '2px solid #00ff66', borderRadius: '6px', padding: '12px 20px', marginBottom: '20px', backgroundColor: '#040a04', boxShadow: '0 0 15px rgba(0, 255, 102, 0.2)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>🟢 POKÉDEX [TERMINAL v2.0]</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#00ff66', borderRadius: '50%' }}></div>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#00cc55', borderRadius: '50%' }}></div>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#008833', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda Interactiva con soporte total de mayúsculas/minúsculas */}
        <div className="mb-4">
          <Form.Control
            type="text"
            placeholder="> BUSCAR_ESPECIMEN (ej. pika, char)..."
            style={{
              backgroundColor: '#040a04',
              color: '#00ff66',
              border: '2px solid #00ff66',
              fontFamily: '"Courier New", Courier, monospace',
              borderRadius: '4px',
              padding: '12px'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#00ff66' }} />
            <p className="mt-2" style={{ color: '#00ff66' }}>CARGANDO REGISTROS DE LA API...</p>
          </div>
        ) : (
          <Row className="g-4">
            
            {/* Columna Izquierda: Lista de Pokémon */}
            <Col md={5}>
              <div style={{ border: '2px solid #00ff66', borderRadius: '6px', backgroundColor: '#040a04', height: '460px', overflowY: 'auto', padding: '10px' }}>
                <div style={{ borderBottom: '1px dashed #00ff66', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                  LISTA DE REGISTROS (A-Z)
                </div>
                {filteredPokemons.length > 0 ? (
                  filteredPokemons.map((poke, index) => {
                    const isSelected = selectedPokemon?.name === poke.name;
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedPokemon(poke)}
                        style={{
                          padding: '8px 10px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#00ff66' : 'transparent',
                          color: isSelected ? '#040a04' : '#00ff66',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          borderRadius: '3px',
                          marginBottom: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: '0.1s'
                        }}
                      >
                        <span>#{String(poke.id).padStart(3, '0')}</span>
                        <span style={{ textTransform: 'uppercase', flex: 1, marginLeft: '15px' }}>{poke.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4" style={{ color: '#008833', fontSize: '0.9rem' }}>[SIN COINCIDENCIAS]</div>
                )}
              </div>
            </Col>

            {/* Columna Derecha: Panel de Detalles Retro */}
            <Col md={7}>
              {selectedPokemon && (
                <div style={{ border: '2px solid #00ff66', borderRadius: '6px', backgroundColor: '#040a04', height: '460px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 0 15px rgba(0, 255, 102, 0.15)' }}>
                  <div>
                    <div className="d-flex justify-content-between align-items-center border-bottom border-success pb-2 mb-3">
                      <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.3rem', textTransform: 'uppercase', color: '#00ff66' }}>
                        #{String(selectedPokemon.id).padStart(3, '0')} {selectedPokemon.name}
                      </h4>
                      <div>
                        {selectedPokemon.types.map((t, idx) => (
                          <span key={idx} style={{ border: '1px solid #00ff66', padding: '2px 6px', marginRight: '4px', fontSize: '0.75rem', textTransform: 'uppercase', borderRadius: '2px' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-center my-3">
                      <img
                        src={selectedPokemon.image}
                        alt={selectedPokemon.name}
                        style={{ width: '130px', height: '130px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(0,255,102,0.5))' }}
                      />
                    </div>

                    <div style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                      <div><strong>PESO:</strong> {selectedPokemon.weight} kg</div>
                      <div><strong>ALTURA:</strong> {selectedPokemon.height} m</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed #00ff66', paddingTop: '10px', fontSize: '0.85rem', color: '#00cc55', textTransform: 'uppercase' }}>
                    <span>ESTADO: SISTEMA EN LÍNEA // FILTRADO ACTIVO</span>
                  </div>
                </div>
              )}
            </Col>

          </Row>
        )}
      </Container>
    </div>
  );
}

export default CharacterLoader;