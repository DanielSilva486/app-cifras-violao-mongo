import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { ArrowLeft, Save, Eye, Music, Lightbulb } from 'lucide-react';
import { mockCifras, allChords } from '../mock/cifras';
import { useToast } from '../hooks/use-toast';

export const CifraEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    titulo: '',
    artista: '',
    tom_original: 'C',
    categoria: 'Rock',
    letra: ''
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const cifra = mockCifras.find(c => c.id === parseInt(id));
      if (cifra) {
        setFormData({
          titulo: cifra.titulo,
          artista: cifra.artista,
          tom_original: cifra.tom_original,
          categoria: cifra.categoria,
          letra: cifra.letra
        });
      }
    }
  }, [id, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.titulo.trim() || !formData.artista.trim() || !formData.letra.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, artista e letra da cifra",
        variant: "destructive"
      });
      return;
    }

    // Simulate save (in real app, this would call the backend)
    const newCifra = {
      ...formData,
      id: isEditing ? parseInt(id) : Date.now(),
      tom_atual: formData.tom_original,
      created_at: new Date()
    };

    if (isEditing) {
      const index = mockCifras.findIndex(c => c.id === parseInt(id));
      if (index !== -1) {
        mockCifras[index] = { ...mockCifras[index], ...newCifra };
      }
    } else {
      mockCifras.push(newCifra);
    }

    toast({
      title: isEditing ? "Cifra atualizada" : "Cifra salva",
      description: `"${formData.titulo}" foi ${isEditing ? 'atualizada' : 'salva'} com sucesso!`,
    });

    navigate('/');
  };

  const handlePreview = () => {
    if (formData.letra.trim()) {
      setShowPreview(!showPreview);
    } else {
      toast({
        title: "Letra vazia",
        description: "Adicione a letra da cifra para visualizar",
        variant: "destructive"
      });
    }
  };

  const renderPreviewContent = (letra) => {
    const lines = letra.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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
              <h1 className="text-2xl font-bold text-white">
                {isEditing ? 'Editar Cifra' : 'Nova Cifra'}
              </h1>
              <p className="text-gray-300">
                {isEditing ? 'Edite os dados da cifra' : 'Adicione uma nova cifra à sua coleção'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handlePreview}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar' : 'Visualizar'}
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Music className="h-5 w-5 mr-2" />
                Dados da Cifra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-white">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Nome da música"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-pink-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artista" className="text-white">Artista *</Label>
                  <Input
                    id="artista"
                    value={formData.artista}
                    onChange={(e) => handleInputChange('artista', e.target.value)}
                    placeholder="Nome do artista"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-pink-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tom" className="text-white">Tom Original</Label>
                  <Select value={formData.tom_original} onValueChange={(value) => handleInputChange('tom_original', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allChords.slice(0, 12).map(chord => (
                        <SelectItem key={chord} value={chord}>{chord}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-white">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rock">Rock</SelectItem>
                      <SelectItem value="Rock Nacional">Rock Nacional</SelectItem>
                      <SelectItem value="Pop">Pop</SelectItem>
                      <SelectItem value="MPB">MPB</SelectItem>
                      <SelectItem value="Sertanejo">Sertanejo</SelectItem>
                      <SelectItem value="Blues">Blues</SelectItem>
                      <SelectItem value="Jazz">Jazz</SelectItem>
                    <SelectItem value="Gospel">Gospel</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Letra */}
              <div className="space-y-2">
                <Label htmlFor="letra" className="text-white">Letra com Cifras *</Label>
                <Textarea
                  id="letra"
                  value={formData.letra}
                  onChange={(e) => handleInputChange('letra', e.target.value)}
                  placeholder="Digite a letra com os acordes entre colchetes [C] [G] [Am] [F]"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-pink-400 min-h-96 font-mono"
                />
              </div>

              {/* Help */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-2">Dicas para escrever cifras:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Use colchetes para acordes: [C] [G] [Am] [F]</li>
                      <li>• Os acordes aparecerão acima das palavras</li>
                      <li>• Use quebras de linha para separar seções</li>
                      <li>• Exemplo: [C]Imagine there's no [F]heaven</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Visualização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">{formData.titulo || 'Título da Música'}</h3>
                  <p className="text-gray-300">{formData.artista || 'Nome do Artista'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-400">Tom:</span>
                    <span className="text-yellow-400 font-bold">{formData.tom_original}</span>
                    <span className="text-sm text-gray-400">|</span>
                    <span className="text-sm text-pink-400">{formData.categoria}</span>
                  </div>
                </div>
                <div className="text-white font-mono leading-loose whitespace-pre-line text-sm bg-black/20 p-4 rounded-lg max-h-96 overflow-y-auto">
                  {formData.letra ? renderPreviewContent(formData.letra) : (
                    <p className="text-gray-400 italic">Digite a letra para visualizar...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};