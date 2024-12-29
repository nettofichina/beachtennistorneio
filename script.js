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
const limparCamposBtn = document.getElementById('limparCampos');

let jogadores = [];
let duplas = [];
let jogos = [];
let campeonatos = [];
let ranking = {};

// Função para Normalizar Nomes (agora apenas para maiúsculas)
function normalizarNome(nome) {
    return nome.toUpperCase().trim();
}

// Salvar Estado Completo
window.addEventListener('beforeunload', (e) => {
    localStorage.setItem('currentState', JSON.stringify({
        jogadores: jogadores,
        duplas: duplas,
        jogos: jogos,
        nomeTorneio: nomeTorneioInput.value,
        dataTorneio: dataTorneioInput.value
    }));
});

// Carregar campeonatos e estado completo do localStorage ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedCampeonatos = localStorage.getItem('campeonatos');
    if (savedCampeonatos) {
        campeonatos = JSON.parse(savedCampeonatos);
    }

    const savedState = localStorage.getItem('currentState');
    if (savedState) {
        const { jogadores: savedJogadores, duplas: savedDuplas, jogos: savedJogos, nomeTorneio, dataTorneio } = JSON.parse(savedState);
        jogadores = savedJogadores;
        duplas = savedDuplas;
        jogos = savedJogos;
        nomeTorneioInput.value = nomeTorneio || '';  // Usar valor salvo ou string vazia
        dataTorneioInput.value = dataTorneio || '';  // Usar valor salvo ou string vazia

        // Atualizar a lista de jogadores na interface
        listaJogadores.innerHTML = '';
        jogadores.forEach(jogador => {
            const li = document.createElement('li');
            li.textContent = jogador;
            li.setAttribute('aria-label', `Jogador: ${jogador}`);
            li.setAttribute('role', 'listitem');
            li.addEventListener('dblclick', () => removerJogador(jogador, li));
            listaJogadores.appendChild(li);
        });

        // Gerar chaves e restaurar estado dos jogos submetidos
        if (duplas.length) {
            gerarChaves();
        }
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

    // Embaralhar jogadores e criar duplas
    const jogadoresEmbaralhados = [...jogadores].sort(() => Math.random() - 0.5);
    duplas = [];
    for (let i = 0; i < jogadoresEmbaralhados.length; i += 2) {
        duplas.push([jogadoresEmbaralhados[i], jogadoresEmbaralhados[i + 1]]);
    }

    // Atualiza apenas as chaves com as novas duplas
    gerarChaves();
});


function submeterJogo(index, btn, input) {
    const jogo = jogos[index];
    const placar = jogo.placar;

    if (/^\d+-\d+$/.test(placar)) {
        if (!jogo.submetido) {
            input.disabled = true;
            jogo.submetido = true;
            btn.style.display = 'none'; // Esconde o botão após submissão
        }

        // Atualizar localStorage com o estado atualizado
        localStorage.setItem('currentState', JSON.stringify({
            jogadores: jogadores,
            duplas: duplas,
            jogos: jogos,
            nomeTorneio: nomeTorneioInput.value,
            dataTorneio: dataTorneioInput.value
        }));
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
}

function gerarChaves() {
    // Limpa as chaves e jogos para evitar duplicação
    chavesDiv.innerHTML = '';
    placaresDiv.innerHTML = '';
    const novosJogos = [];

    // Cria jogos a partir das duplas
    for (let i = 0; i < duplas.length; i++) {
        for (let j = i + 1; j < duplas.length; j++) {
            const jogoExistente = jogos.find(j => 
                j.dupla1.toString() === duplas[i].toString() &&
                j.dupla2.toString() === duplas[j].toString()
            );
            if (!jogoExistente) {
                novosJogos.push({ dupla1: duplas[i], dupla2: duplas[j], placar: '', submetido: false });
            }
        }
    }

    jogos = novosJogos;

    // Renderiza os jogos na interface
    jogos.forEach((jogo, index) => {
        const jogoDiv = document.createElement('div');
        jogoDiv.className = 'jogo';

        const jogoInfo = document.createElement('span');
        jogoInfo.textContent = `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`;

        const inputPlacar = document.createElement('input');
        inputPlacar.type = 'text';
        inputPlacar.placeholder = 'Placar (ex: 6-1)';
        inputPlacar.dataset.index = index;
        inputPlacar.value = jogo.placar;
        inputPlacar.disabled = jogo.submetido;
        inputPlacar.addEventListener('change', (e) => {
            const placar = e.target.value;
            if (/^\d+-\d+$/.test(placar)) {
                jogos[e.target.dataset.index].placar = placar;
            } else {
                alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
                e.target.value = '';
            }
        });

        const submeterBtn = document.createElement('button');
        submeterBtn.textContent = 'Submeter';
        submeterBtn.className = 'submeter-jogo';
        submeterBtn.style.display = jogo.submetido ? 'none' : 'inline';
        submeterBtn.addEventListener('click', () => {
            submeterJogo(index, submeterBtn, inputPlacar, jogoDiv);
        });

        // Adiciona o botão "Editar"
        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.className = 'editar-placar';
        editarBtn.style.display = jogo.submetido ? 'inline' : 'none'; // Mostrar o botão "Editar" apenas se o placar foi submetido
        editarBtn.addEventListener('click', () => {
            inputPlacar.disabled = false;
            jogo.submetido = false;
            submeterBtn.style.display = 'inline';
            editarBtn.style.display = 'none';
        });

        jogoDiv.appendChild(jogoInfo);
        jogoDiv.appendChild(inputPlacar);
        jogoDiv.appendChild(submeterBtn);
        jogoDiv.appendChild(editarBtn);
        chavesDiv.appendChild(jogoDiv);
    });

    // Atualiza o estado no localStorage
    localStorage.setItem('currentState', JSON.stringify({
        jogadores: jogadores,
        duplas: duplas,
        jogos: jogos,
        nomeTorneio: nomeTorneioInput.value,
        dataTorneio: dataTorneioInput.value
    }));
}

function submeterJogo(index, btn, input, jogoDiv) {
    const jogo = jogos[index];
    const placar = jogo.placar;

    if (/^\d+-\d+$/.test(placar)) {
        if (!jogo.submetido) {
            input.disabled = true;
            jogo.submetido = true;
            btn.style.display = 'none'; 

            // Mostrar o botão "Editar"
            const editarBtn = jogoDiv.querySelector('.editar-placar');
            if (editarBtn) {
                editarBtn.style.display = 'inline';
            }
        }

        // Atualizar localStorage com o estado atualizado
        localStorage.setItem('currentState', JSON.stringify({
            jogadores: jogadores,
            duplas: duplas,
            jogos: jogos,
            nomeTorneio: nomeTorneioInput.value,
            dataTorneio: dataTorneioInput.value
        }));
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
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

    // Limpar o estado temporário do localStorage após salvar o campeonato
    localStorage.removeItem('currentState');

    // Limpar todos os campos e arrays
    jogadores = [];
    duplas = [];
    jogos = [];
    listaJogadores.innerHTML = '';
    chavesDiv.innerHTML = '';
    placaresDiv.innerHTML = '';
    nomeTorneioInput.value = '';
    dataTorneioInput.value = '';
    nomeJogadorInput.value = '';
    nomeJogadorInput.focus(); // Coloca o foco de volta no input do jogador
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

// Limpar todos os campos
limparCamposBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
        // Limpar apenas os campos e o estado atual
        jogadores = [];
        duplas = [];
        jogos = [];
        listaJogadores.innerHTML = '';
        chavesDiv.innerHTML = '';
        placaresDiv.innerHTML = '';
        nomeTorneioInput.value = '';
        dataTorneioInput.value = '';
        nomeJogadorInput.value = '';
        rankingDiv.innerHTML = ''; // Limpa o ranking exibido, mas não afeta a funcionalidade
        campeonatosDiv.innerHTML = ''; // Limpa os campeonatos exibidos, mas não afeta os dados salvos
        
        // Limpar apenas o estado temporário do localStorage
        localStorage.removeItem('currentState');
        
        // Reiniciar foco
        nomeJogadorInput.focus();
    }
});

// Carregar campeonatos e estado completo do localStorage ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedCampeonatos = localStorage.getItem('campeonatos');
    if (savedCampeonatos) {
        campeonatos = JSON.parse(savedCampeonatos);
    }

    const savedState = localStorage.getItem('currentState');
    if (savedState) {
        const { jogadores: savedJogadores, duplas: savedDuplas, jogos: savedJogos, nomeTorneio, dataTorneio } = JSON.parse(savedState);
        jogadores = savedJogadores;
        duplas = savedDuplas;
        jogos = savedJogos;
        nomeTorneioInput.value = nomeTorneio || '';  // Usar valor salvo ou string vazia
        dataTorneioInput.value = dataTorneio || '';  // Usar valor salvo ou string vazia

        // Atualizar a lista de jogadores na interface
        listaJogadores.innerHTML = '';
        jogadores.forEach(jogador => {
            const li = document.createElement('li');
            li.textContent = jogador;
            li.setAttribute('aria-label', `Jogador: ${jogador}`);
            li.setAttribute('role', 'listitem');
            li.addEventListener('dblclick', () => removerJogador(jogador, li));
            listaJogadores.appendChild(li);
        });

        // Gerar chaves e restaurar estado dos jogos submetidos
        if (duplas.length) {
            gerarChaves();
        }
    }
});