document.addEventListener('DOMContentLoaded', () => {
    // Navegação para outras páginas
    document.getElementById('informarDuplas').addEventListener('click', () => {
        window.location.href = 'duplas-manuais.html';
    });

    document.getElementById('sortearDuplas').addEventListener('click', () => {
        window.location.href = 'duplas-aleatorias.html';
    });

    // Funções para gerenciar campeonatos e ranking
    let campeonatos = JSON.parse(localStorage.getItem('campeonatos') || '[]');

    document.getElementById('verCampeonatosBtn').addEventListener('click', () => {
        // ... (código para ver campeonatos)
    });

    document.getElementById('rankingBtn').addEventListener('click', () => {
        // ... (código para gerar ranking)
    });

    // Função para exportar dados
    document.getElementById('exportarDados').addEventListener('click', exportarDados);
    document.getElementById('exportarDados').addEventListener('touchstart', exportarDados);

    // Função para importar dados
    document.getElementById('importarDados').addEventListener('click', importarDados);
    document.getElementById('importarDados').addEventListener('touchstart', importarDados);

    function exportarDados(e) {
        e.preventDefault();
        const dados = {
            campeonatos: campeonatos // Usamos a variável campeonatos atualizada
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "dados_beach_tennis.json");
        downloadAnchorNode.setAttribute("target", "_blank"); 
        document.body.appendChild(downloadAnchorNode); 
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function importarDados(e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const dadosImportados = JSON.parse(event.target.result);
                    if (dadosImportados.campeonatos) {
                        // Atualiza a base de dados com o conteúdo importado
                        localStorage.setItem('campeonatos', JSON.stringify(dadosImportados.campeonatos));
                        campeonatos = dadosImportados.campeonatos; // Atualiza a variável campeonatos
                        alert('Dados importados com sucesso! A base de dados foi atualizada.');
                    } else {
                        alert('Arquivo inválido ou dados corrompidos.');
                    }
                } catch (error) {
                    alert('Erro ao importar dados: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
});