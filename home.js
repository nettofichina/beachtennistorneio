document.getElementById('informarDuplas').addEventListener('click', () => {
    window.location.href = 'duplas-manuais.html';
});

document.getElementById('sortearDuplas').addEventListener('click', () => {
    window.location.href = 'duplas-aleatorias.html';
});

// Funções para gerenciar campeonatos e ranking
let campeonatos = JSON.parse(localStorage.getItem('campeonatos') || '[]');

document.getElementById('verCampeonatosBtn').addEventListener('click', () => {
    const campeonatosDiv = document.getElementById('campeonatos');
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

        const toggleResultadosBtn = document.createElement('button');
        toggleResultadosBtn.textContent = 'Ver Resultados';
        toggleResultadosBtn.className = 'toggle-resultados';
        campeonatoDiv.appendChild(toggleResultadosBtn);

        const resultadosContainer = document.createElement('div');
        resultadosContainer.className = 'resultados-container';
        resultadosContainer.style.display = 'none';
        campeonatoDiv.appendChild(resultadosContainer);

        toggleResultadosBtn.addEventListener('click', () => {
            if (resultadosContainer.style.display === 'none') {
                resultadosContainer.style.display = 'block';
                toggleResultadosBtn.textContent = 'Ocultar Resultados';
            } else {
                resultadosContainer.style.display = 'none';
                toggleResultadosBtn.textContent = 'Ver Resultados';
            }
            
            resultadosContainer.innerHTML = '';
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

        campeonatoDiv.addEventListener('dblclick', (e) => {
            if (confirm('Tem certeza que deseja remover este campeonato?')) {
                campeonatos.splice(index, 1);
                localStorage.setItem('campeonatos', JSON.stringify(campeonatos));
                document.getElementById('verCampeonatosBtn').click(); // Re-rendereizar a lista de campeonatos
            }
        });

        campeonatosDiv.appendChild(campeonatoDiv);
    });
});

document.getElementById('rankingBtn').addEventListener('click', () => {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const rankingDiv = document.getElementById('ranking');
    let ranking = {};

    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione um intervalo de datas para gerar o ranking.');
        return;
    }

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
                    const nomeNormalizado = jogador.toUpperCase().trim();
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

document.getElementById('informarDuplas').addEventListener('click', () => {
    window.location.href = 'duplas-manuais.html';
});

document.getElementById('sortearDuplas').addEventListener('click', () => {
    window.location.href = 'duplas-aleatorias.html';
});
