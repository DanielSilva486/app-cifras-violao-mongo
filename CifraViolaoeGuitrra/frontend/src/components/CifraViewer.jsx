import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Edit,
  Music2,
  Volume2
} from 'lucide-react';
import { mockCifras, transposeChord, allChords } from '../mock/cifras';
import { useToast } from '../hooks/use-toast';

export const CifraViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cifra, setCifra] = useState(null);
  const [currentKey, setCurrentKey] = useState('');
  const [semitones, setSemitones] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState([1]);
  const [fontSize, setFontSize] = useState([16]);
  const scrollRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const foundCifra = mockCifras.find(c => c.id === parseInt(id));
    if (foundCifra) {
      setCifra({ ...foundCifra });
      setCurrentKey(foundCifra.tom_original);
    }
  }, [id]);

  useEffect(() => {
    if (isAutoScroll) {
      intervalRef.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += scrollSpeed[0];
        }
      }, 50);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAutoScroll, scrollSpeed]);

  const transposeCifra = (letra, semitones) => {
    return letra.replace(/\[([^\]]+)\]/g, (match, chord) => {
      return `[${transposeChord(chord, semitones)}]`;
    });
  };

  const handleKeyChange = (newKey) => {
    if (!cifra) return;
    
    const originalKeyIndex = allChords.findIndex(chord => chord === cifra.tom_original);
    const newKeyIndex = allChords.findIndex(chord => chord === newKey);
    
    if (originalKeyIndex !== -1 && newKeyIndex !== -1) {
      const newSemitones = (newKeyIndex - originalKeyIndex + 12) % 12;
      setSemitones(newSemitones);
      setCurrentKey(newKey);
      
      const newCifra = {
        ...cifra,
        letra: transposeCifra(cifra.letra, newSemitones - semitones),
        tom_atual: newKey
      };
      setCifra(newCifra);
      
      toast({
        title: "Tom alterado",
        description: `Cifra transposta para ${newKey}`,
      });
    }
  };

  const handleSemitoneChange = (increment) => {
    const newSemitones = semitones + increment;
    setSemitones(newSemitones);
    
    const originalKeyIndex = allChords.findIndex(chord => chord === cifra.tom_original);
    const newKeyIndex = (originalKeyIndex + newSemitones + 12) % 12;
    const newKey = allChords[newKeyIndex];
    
    setCurrentKey(newKey);
    
    const newCifra = {
      ...cifra,
      letra: transposeCifra(cifra.letra, increment),
      tom_atual: newKey
    };
    setCifra(newCifra);
    
    toast({
      title: "Tom alterado",
      description: `${increment > 0 ? '+' : ''}${increment} semitom(s)`,
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleAutoScroll = () => {
    setIsAutoScroll(!isAutoScroll);
    toast({
      title: isAutoScroll ? "Auto-rolagem pausada" : "Auto-rolagem iniciada",
      description: isAutoScroll ? "Rolagem automática pausada" : "Rolagem automática ativada",
    });
  };

  const renderCifraContent = (letra) => {
    const lines = letra.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Check if line contains chords
      if (line.includes('[') && line.includes(']')) {
        const parts = line.split(/(\[[^\]]+\])/);
        return (
          <div key={index} className="leading-relaxed mb-2">
            {parts.map((part, partIndex) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                const chord = part.slice(1, -1);
                return (
                  <span key={partIndex} className="relative">
                    <span className="absolute -top-6 text-yellow-400 font-bold text-sm bg-black/20 px-1 rounded">
                      {chord}
                    </span>
                  </span>
                );
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </div>
        );
      } else {
        return (
          <div key={index} className="leading-relaxed mb-2">
            {line}
          </div>
        );
      }
    });
  };

  if (!cifra) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Music2 className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-spin" />
          <p className="text-xl text-white">Carregando cifra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ${isFullscreen ? 'p-4' : ''}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{cifra.titulo}</h1>
              <p className="text-gray-300">{cifra.artista}</p>
            </div>
            <Badge className="bg-gradient-to-r from-pink-500/20 to-yellow-500/20 text-yellow-300 border-yellow-400/30">
              {cifra.categoria}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate(`/editor/${cifra.id}`)}
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-full"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button 
              onClick={toggleFullscreen}
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-full"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 bg-black/10 backdrop-blur-lg border-b border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          {/* Key Selection */}
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">Tom:</span>
            <Select value={currentKey} onValueChange={handleKeyChange}>
              <SelectTrigger className="w-20 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allChords.slice(0, 12).map(chord => (
                  <SelectItem key={chord} value={chord}>{chord}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semitone Controls */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleSemitoneChange(-1)}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              -1
            </Button>
            <Badge variant="outline" className="text-white border-white/30 min-w-16 text-center">
              {semitones > 0 ? `+${semitones}` : semitones}
            </Badge>
            <Button 
              onClick={() => handleSemitoneChange(1)}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              +1
            </Button>
          </div>

          {/* Auto Scroll Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleAutoScroll}
              variant="outline"
              className={`${isAutoScroll ? 'bg-pink-500/20 border-pink-400' : 'bg-white/10 border-white/20'} text-white hover:bg-pink-500/30`}
            >
              {isAutoScroll ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="ml-2">{isAutoScroll ? 'Pausar' : 'Auto-Scroll'}</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-white" />
              <Slider
                value={scrollSpeed}
                onValueChange={setScrollSpeed}
                max={5}
                min={0.5}
                step={0.5}
                className="w-24"
              />
              <span className="text-white text-sm min-w-8">{scrollSpeed[0]}x</span>
            </div>
          </div>

          {/* Font Size Control */}
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">A</span>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              max={24}
              min={12}
              step={2}
              className="w-20"
            />
            <span className="text-white text-lg">A</span>
          </div>
        </div>
      </div>

      {/* Cifra Content */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto px-6 py-8"
          style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
          <Card className="bg-black/20 backdrop-blur-lg border-white/10 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{cifra.titulo} - {cifra.artista}</span>
                <Badge className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white">
                  Tom: {currentKey}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-white font-mono leading-loose whitespace-pre-line"
                style={{ fontSize: `${fontSize[0]}px` }}
              >
                {renderCifraContent(cifra.letra)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};