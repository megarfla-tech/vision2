
import { Channel } from '../types';

const M3U_URL = 'https://raw.githubusercontent.com/Megarfla/Mt/refs/heads/main/tv';

export const fetchChannels = async (): Promise<Channel[]> => {
  try {
    const response = await fetch(M3U_URL);
    if (!response.ok) throw new Error('Falha ao carregar lista IPTV remota.');
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error('M3U Parser Error:', error);
    throw error;
  }
};

const parseM3U = (data: string): Channel[] => {
  const lines = data.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};
  let count = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // 1. Extração do nome do canal (tudo após a última vírgula)
      const commaIndex = line.lastIndexOf(',');
      let name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : `Canal ${count}`;
      
      // Limpeza de sufixos comuns em listas IPTV para deixar o nome mais limpo
      name = name.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
      if (!name) name = `Canal ${count}`;

      // 2. Extração de atributos usando Regex flexível (com ou sem aspas)
      // Ex: tvg-logo="url" OU tvg-logo=url
      const getAttr = (key: string) => {
        const regex = new RegExp(`${key}=["']?([^"']*)["']?`, 'i');
        const match = line.match(regex);
        return match ? match[1] : undefined;
      };

      const logo = getAttr('tvg-logo');
      const group = getAttr('group-title') || 'Geral';
      const id = getAttr('tvg-id') || `ch-${count}`;

      currentChannel = {
        id: id,
        number: count,
        name: name,
        logo: logo,
        group: group
      };
    } else if (line.startsWith('http')) {
      // Se encontrou URL e temos metadados anteriores
      if (currentChannel.name) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        count++;
        // Reset para evitar duplicatas erradas
        currentChannel = {};
      }
    }
  }

  return channels;
};
