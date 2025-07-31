// Arquivo: frontend/src/components/CifraEditor.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Lista de tons e categorias, pode ser movida para um arquivo de configuração se preferir
const TONS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CATEGORIAS = ["Gospel", "Rock", "Rock Nacional", "Pop", "MPB", "Sertanejo", "Blues", "Jazz", "Outros"];

export const CifraEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    titulo: '',
    artista: '',
    tom: 'C',
    categoria: 'Gospel',
    letra: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      axios.get(`${API_URL}/api/cifras/${id}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error("Erro ao buscar cifra para edição:", error);
          toast({
            title: "Erro ao carregar",
            description: "Não foi possível encontrar a cifra para edição.",
            variant: "destructive",
          });
          navigate('/editor'); // Volta para o editor em branco se não encontrar
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEditing, navigate, toast]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.titulo.trim() || !formData.artista.trim() || !formData.letra.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, artista e letra da cifra.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        // Atualiza uma cifra existente
        await axios.put(`${API_URL}/api/cifras/${id}`, formData);
      } else {
        // Cria uma nova cifra
        await axios.post(`${API_URL}/api/cifras`, formData);
      }

      toast({
        title: isEditing ? "Cifra atualizada!" : "Cifra salva!",
        description: `"${formData.titulo}" foi salva com sucesso no banco de dados.`,
      });

      navigate('/'); // Navega para a página inicial

    } catch (error) {
      console.error("Erro ao salvar a cifra:", error);
      toast({
        title: "Erro ao salvar",
        description: `O servidor retornou um erro: ${error.response?.data?.detail || error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Cifra' : 'Nova Cifra'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" value={formData.titulo} onChange={(e) => handleInputChange('titulo', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="artista">Artista *</Label>
              <Input id="artista" value={formData.artista} onChange={(e) => handleInputChange('artista', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tom">Tom Original</Label>
              <Select value={formData.tom} onValueChange={(value) => handleInputChange('tom', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="letra">Letra com Cifras *</Label>
            <Textarea id="letra" value={formData.letra} onChange={(e) => handleInputChange('letra', e.target.value)} rows={15} />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Salvando...' : <><Save className="h-4 w-4 mr-2" /> Salvar</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};