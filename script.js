// Seleção de elementos
const nomeTorneioInput = document.getElementById('nomeTorneio');
const dataTorneioInput = document.getElementById('dataTorneio');
const nomeJogadorInput = document.getElementById('nomeJogador');
const adicionarJogadorBtn = document.getElementById('adicionarJogador');
const listaJogadores = document.getElementById('listaJogadores');
const sortearDuplasBtn = document.getElementById('sortearDuplas');
const chavesDiv = document.getElementById('chaves');
const placaresDiv = document.getElementById('placares');
const salvarCampeonatoBtn = document.getElementById('salvarCampeonato');
const verCampeonatosBtn = document.getElementById('verCampeonatosBtn');
const rankingBtn = document.getElementById('rankingBtn');
const dataInicioInput = document.getElementById('dataInicio');
const dataFimInput = document.getElementById('dataFim');
const campeonatosDiv = document.getElementById('campeonatos');
const rankingDiv = document.getElementById('ranking');

let jogadores = [];
let duplas = [];
let jogos = [];
let campeonatos = [];
let ranking = {};

// Função para Normalizar Nomes (agora apenas para maiúsculas)
function normalizarNome(nome) {
    return nome.toUpperCase().trim();
}

// Carregar campeonatos salvos do localStorage ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedCampeonatos = localStorage.getItem('campeonatos');
    if (savedCampeonatos) {
        campeonatos = JSON.parse(savedCampeonatos);
    }
});

// Adicionar jogador ao pressionar Enter
nomeJogadorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        adicionarJogador();
    }
});

// Adicionar jogador ao clicar no botão
adicionarJogadorBtn.addEventListener('click', adicionarJogador);

function adicionarJogador() {
    const nomeJogador = normalizarNome(nomeJogadorInput.value);
    if (nomeJogador && !jogadores.includes(nomeJogador)) {
        jogadores.push(nomeJogador);
        const li = document.createElement('li');
        li.textContent = nomeJogador; // Exibe o nome em maiúsculas
        li.setAttribute('aria-label', `Jogador: ${nomeJogador}`);
        li.setAttribute('role', 'listitem');
        li.addEventListener('dblclick', () => removerJogador(nomeJogador, li));
        listaJogadores.appendChild(li);
        nomeJogadorInput.value = '';
        nomeJogadorInput.focus();
    } else {
        alert('Jogador já adicionado ou nome inválido!');
    }
}

function removerJogador(nomeJogador, elemento) {
    const index = jogadores.indexOf(nomeJogador);
    if (index !== -1) {
        jogadores.splice(index, 1);
        listaJogadores.removeChild(elemento);
        nomeJogadorInput.focus();
    }
}

// Sortear duplas
sortearDuplasBtn.addEventListener('click', () => {
    if (jogadores.length < 4 || jogadores.length % 2 !== 0) {
        alert('É necessário pelo menos 4 jogadores e um número par!');
        return;
    }

    const jogadoresEmbaralhados = jogadores.sort(() => Math.random() - 0.5);
    duplas = [];
    for (let i = 0; i < jogadoresEmbaralhados.length; i += 2) {
        duplas.push([jogadoresEmbaralhados[i], jogadoresEmbaralhados[i + 1]]);
    }

    gerarChaves();
});

function gerarChaves() {
    chavesDiv.innerHTML = '';
    placaresDiv.innerHTML = '';
    jogos = [];

    for (let i = 0; i < duplas.length; i++) {
        for (let j = i + 1; j < duplas.length; j++) {
            jogos.push({ dupla1: duplas[i], dupla2: duplas[j], placar: '' });
        }
    }

    jogos.forEach((jogo, index) => {
        const jogoDiv = document.createElement('div');
        jogoDiv.className = 'jogo';

        const jogoInfo = document.createElement('span');
        jogoInfo.textContent = `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`;

        const inputPlacar = document.createElement('input');
        inputPlacar.type = 'text';
        inputPlacar.placeholder = 'Placar (ex: 6-1)';
        inputPlacar.dataset.index = index;
        inputPlacar.addEventListener('change', (e) => {
            const placar = e.target.value;
            if (/^\d+-\d+$/.test(placar)) {
                jogos[e.target.dataset.index].placar = placar;
            } else {
                alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
                e.target.value = '';
            }
        });

        jogoDiv.appendChild(jogoInfo);
        jogoDiv.appendChild(inputPlacar);
        chavesDiv.appendChild(jogoDiv);
    });
}

// Salvar campeonato
salvarCampeonatoBtn.addEventListener('click', () => {
    const nomeTorneio = nomeTorneioInput.value.trim();
    const dataTorneio = dataTorneioInput.value;
    if (!nomeTorneio || !dataTorneio) {
        alert('Digite o nome do torneio e a data antes de salvar!');
        return;
    }

    const resultados = {
        torneio: nomeTorneio,
        data: dataTorneio,
        jogadores: jogadores,
        jogos: jogos,
    };

    campeonatos.push(resultados);
    localStorage.setItem('campeonatos', JSON.stringify(campeonatos));
    console.log('Campeonato salvo:', resultados);
    alert('Campeonato salvo com sucesso! Confira os dados no console.');
});

// Ver campeonatos
verCampeonatosBtn.addEventListener('click', () => {
    campeonatosDiv.innerHTML = '';

    campeonatos.forEach((campeonato, index) => {
        const campeonatoDiv = document.createElement('div');
        campeonatoDiv.className = 'campeonato';

        const titulo = document.createElement('h4');
        titulo.textContent = campeonato.torneio;
        campeonatoDiv.appendChild(titulo);

        const dataSpan = document.createElement('p');
        dataSpan.textContent = `Dia do Torneio: ${campeonato.data}`;
        campeonatoDiv.appendChild(dataSpan);

        // Botão para expandir/ocultar resultados
        const toggleResultadosBtn = document.createElement('button');
        toggleResultadosBtn.textContent = 'Ver Resultados';
        toggleResultadosBtn.className = 'toggle-resultados';
        campeonatoDiv.appendChild(toggleResultadosBtn);

        // Container para os resultados
        const resultadosContainer = document.createElement('div');
        resultadosContainer.className = 'resultados-container';
        resultadosContainer.style.display = 'none';  // Começa oculto
        campeonatoDiv.appendChild(resultadosContainer);

        toggleResultadosBtn.addEventListener('click', () => {
            if (resultadosContainer.style.display === 'none') {
                resultadosContainer.style.display = 'block';
                toggleResultadosBtn.textContent = 'Ocultar Resultados';
            } else {
                resultadosContainer.style.display = 'none';
                toggleResultadosBtn.textContent = 'Ver Resultados';
            }
            
            // Popula os resultados do campeonato
            resultadosContainer.innerHTML = '';  // Limpa o conteúdo anterior antes de adicionar novo
            campeonato.jogos.forEach((jogo) => {
                const jogoDiv = document.createElement('div');
                jogoDiv.className = 'jogo-resultado';
                
                let resultadoTexto = `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`;
                if (jogo.placar) {
                    resultadoTexto += ` - Placar: ${jogo.placar}`;
                    const [set1, set2] = jogo.placar.split('-').map(Number);
                    const vencedor = set1 > set2 ? jogo.dupla1 : (set2 > set1 ? jogo.dupla2 : 'Empate');
                    resultadoTexto += ` (Vencedor: ${vencedor.join(' e ')})`;
                } else {
                    resultadoTexto += ' - Sem placar registrado';
                }
                jogoDiv.textContent = resultadoTexto;
                resultadosContainer.appendChild(jogoDiv);
            });
        });

        // Adiciona evento de duplo clique para remover o campeonato
        campeonatoDiv.addEventListener('dblclick', (e) => {
            if (confirm('Tem certeza que deseja remover este campeonato?')) {
                campeonatos.splice(index, 1);
                localStorage.setItem('campeonatos', JSON.stringify(campeonatos));
                verCampeonatosBtn.click(); // Re-rendereizar a lista de campeonatos
            }
        });

        campeonatosDiv.appendChild(campeonatoDiv);
    });
});

// Gerar ranking
rankingBtn.addEventListener('click', () => {
    const dataInicio = dataInicioInput.value;
    const dataFim = dataFimInput.value;

    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione um intervalo de datas para gerar o ranking.');
        return;
    }

    ranking = {};

    campeonatos.filter(campeonato => {
        const dataCampeonato = new Date(campeonato.data);
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return dataCampeonato >= inicio && dataCampeonato <= fim;
    }).forEach((campeonato) => {
        campeonato.jogos.forEach((jogo) => {
            const { dupla1, dupla2, placar } = jogo;

            if (placar) {
                const [set1, set2] = placar.split('-').map(Number);
                const pontos = set1 - set2;

                [...dupla1, ...dupla2].forEach((jogador) => {
                    const nomeNormalizado = normalizarNome(jogador);
                    ranking[nomeNormalizado] = (ranking[nomeNormalizado] || 0) + (dupla1.includes(jogador) ? pontos : -pontos);
                });
            }
        });
    });

    const rankingArray = Object.entries(ranking).sort((a, b) => b[1] - a[1]);

    rankingDiv.innerHTML = '<h3>Ranking</h3>';
    rankingArray.forEach(([jogador, pontos], index) => {
        const rankItem = document.createElement('div');
        let medalha = '';
        if (index === 0) {
            medalha = '🥇';
        } else if (index === 1) {
            medalha = '🥈';
        } else if (index === 2) {
            medalha = '🥉';
        }
        
        rankItem.innerHTML = `<span class="position">${index + 1}.</span> ${medalha} ${jogador}: ${pontos} pontos`;
        rankItem.setAttribute('aria-label', `${jogador} tem ${pontos} pontos e está na posição ${index + 1}.`);
        rankingDiv.appendChild(rankItem);
    });
});