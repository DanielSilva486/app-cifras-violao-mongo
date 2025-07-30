import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Search, Music, Calendar, User, Coffee, Heart, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockCifras } from '../mock/cifras';

export const HomePage = () => {
  const [cifras, setCifras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCifras, setFilteredCifras] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading mock data
    setCifras(mockCifras);
    setFilteredCifras(mockCifras);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = cifras.filter(cifra => 
        cifra.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cifra.artista.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cifra.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCifras(filtered);
    } else {
      setFilteredCifras(cifras);
    }
  }, [searchTerm, cifras]);

  const handleCifraClick = (id) => {
    navigate(`/cifra/${id}`);
  };

  const handleNewCifra = () => {
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-24 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Music className="h-20 w-20 text-yellow-400 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full animate-bounce"></div>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              Cifras de Violão
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Sua coleção completa de cifras com transposição automática, 
              modo tela cheia e rolagem sincronizada.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                onClick={handleNewCifra}
                className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white px-8 py-3 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
              >
                <Plus className="mr-2 h-5 w-5" />
                Nova Cifra
              </Button>
              <Button 
                onClick={() => window.open('https://www.buymeacoffee.com', '_blank')}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
              >
                <Coffee className="mr-2 h-5 w-5" />
                Cafézinho pro dev ☕
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="relative mb-12">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por música, artista ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-lg border-white/20 rounded-2xl text-white placeholder-gray-300 focus:bg-white/15 focus:border-pink-400 transition-all duration-300"
            />
          </div>

          {/* Cifras Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCifras.map((cifra) => (
              <Card 
                key={cifra.id}
                onClick={() => handleCifraClick(cifra.id)}
                className="group cursor-pointer bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-pink-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl rounded-2xl overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-pink-500/20 to-yellow-500/20 text-yellow-300 border-yellow-400/30"
                    >
                      {cifra.categoria}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-pink-300 border-pink-400/50"
                    >
                      {cifra.tom_atual}
                    </Badge>
                  </div>
                  <CardTitle className="text-white group-hover:text-yellow-300 transition-colors duration-200 text-xl">
                    {cifra.titulo}
                  </CardTitle>
                  <CardDescription className="flex items-center text-gray-300 text-base">
                    <User className="h-4 w-4 mr-1" />
                    {cifra.artista}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {cifra.created_at.toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-1" />
                      Tom: {cifra.tom_original}
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full group-hover:w-full transition-all duration-500"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCifras.length === 0 && (
            <div className="text-center py-20">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-300">
                {searchTerm ? 'Nenhuma cifra encontrada' : 'Nenhuma cifra cadastrada ainda'}
              </p>
              <p className="text-gray-400 mt-2">
                {searchTerm ? 'Tente buscar por outro termo' : 'Clique em "Nova Cifra" para começar'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="px-6 py-12 bg-black/20 backdrop-blur-lg border-t border-white/10">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                  <Scale className="h-6 w-6 text-blue-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-400" />
                    Direitos Autorais & Uso Responsável
                  </h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>
                      🎵 <strong>Harpa Cristã:</strong> Os hinos aqui apresentados são obras tradicionais de domínio público, 
                      preservadas pela tradição cristã brasileira.
                    </p>
                    <p>
                      📜 <strong>Uso Pessoal:</strong> Este aplicativo destina-se exclusivamente ao uso pessoal, 
                      estudo e edificação espiritual.
                    </p>
                    <p>
                      ⚖️ <strong>Responsabilidade:</strong> Para uso comercial ou público, procure sempre verificar 
                      os direitos autorais das composições e obter as devidas autorizações.
                    </p>
                    <p>
                      🙏 <strong>Recomendação:</strong> Priorize sempre músicas de domínio público ou com 
                      licenças livres para evitar questões legais.
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20 rounded-lg">
                    <p className="text-xs text-green-200">
                      💡 <strong>Dica:</strong> Se você desenvolve este projeto, considere implementar um sistema 
                      de verificação de licenças para contribuir com o uso ético da música.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};