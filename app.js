// --- ESTADO DA APLICAÇÃO ---
let jogadores = JSON.parse(localStorage.getItem('fichas_skyfall_v2')) || [];
let cemiterio = JSON.parse(localStorage.getItem('memorial_skyfall_v2')) || [];
let fichaAtivaId = null;

// --- NAVEGAÇÃO ---
function mudarTela(telaId) {
    const telas = ['tela-selecao', 'tela-criacao', 'tela-dashboard', 'tela-memorial'];
    telas.forEach(id => document.getElementById(id).classList.add('escondido'));
    document.getElementById(telaId).classList.remove('escondido');
    
    if (telaId === 'tela-selecao') renderizarSelecao();
    if (telaId === 'tela-memorial') renderizarMemorial();
    if (telaId === 'tela-dashboard') renderizarDashboard();
}

// --- SALVAR FICHA (Lógica para as 3 colunas) ---
function salvarFichaComAtributos() {
    const idExistente = document.getElementById('ficha-id').value;
    
    const novaFicha = {
        id: idExistente ? parseInt(idExistente) : Date.now(),
        nome: document.getElementById('ficha-nome').value || "Herói Sem Nome",
        classe: document.getElementById('ficha-classe').value || "Plebeu",
        imagem: document.getElementById('ficha-imagem').value || "",
        // Dados da Coluna 2
        atributos: {
            vida: document.getElementById('attr-vida').value || 20,
        },
        // Dados da Coluna 3
        textos: {
            legado: document.getElementById('txt-legado').value,
            heranca: document.getElementById('txt-heranca').value,
            antecedente: document.getElementById('txt-antecedente').value
        }
    };

    if (idExistente) {
        const index = jogadores.findIndex(j => j.id === novaFicha.id);
        jogadores[index] = novaFicha;
    } else {
        jogadores.push(novaFicha);
    }

    localStorage.setItem('fichas_skyfall_v2', JSON.stringify(jogadores));
    mudarTela('tela-selecao');
}

// --- RENDERIZAR SELEÇÃO ---
function renderizarSelecao() {
    const container = document.getElementById('lista-fichas');
    let html = '';

    jogadores.forEach(j => {
        html += `
            <div class="relative group w-48 h-64 glass rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:-translate-y-2 transition-all shadow-2xl">
                <div onclick="abrirDashboard(${j.id})" class="flex flex-col items-center p-4">
                    <img src="${j.imagem || 'https://via.placeholder.com/150'}" class="w-20 h-20 rounded-full object-cover mb-3 border-2 border-amber-500/20 group-hover:border-amber-500 transition-all">
                    <h3 class="font-serif font-black text-amber-500 text-xs uppercase text-center">${j.nome}</h3>
                    <p class="text-[8px] text-slate-500 uppercase mt-1 tracking-widest">${j.classe}</p>
                </div>
                <div class="absolute -top-2 -right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onclick="matarFicha(${j.id})" class="bg-red-900 text-white p-2 rounded-full text-[10px] shadow-lg">💀</button>
                </div>
            </div>
        `;
    });

    html += `
        <div onclick="abrirCriacao()" class="w-48 h-64 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 hover:text-amber-500 hover:border-amber-500 hover:bg-amber-500/5 transition-all cursor-pointer">
            <span class="text-4xl mb-2">+</span>
            <p class="text-[10px] font-black uppercase tracking-widest">Nova Ficha</p>
        </div>
    `;
    container.innerHTML = html;
}

// --- DASHBOARD (Visualização Premium) ---
function abrirDashboard(id) {
    fichaAtivaId = id;
    mudarTela('tela-dashboard');
}

function renderizarDashboard() {
    const ficha = jogadores.find(j => j.id === fichaAtivaId);
    if (!ficha) return;

    document.getElementById('dashboard-info').innerHTML = `
        <div class="flex flex-col items-center">
            <img src="${ficha.imagem || ''}" class="h-64 object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] mb-6">
            <h1 class="text-7xl font-serif font-black text-amber-500 uppercase italic drop-shadow-2xl">${ficha.nome}</h1>
            <p class="text-amber-500/80 font-bold uppercase tracking-[0.4em] text-xs mb-8">${ficha.classe}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                <div class="glass p-6 rounded-3xl">
                    <h4 class="text-[10px] text-pink-500 font-black uppercase mb-2">Vida</h4>
                    <span class="text-4xl font-serif font-black">${ficha.atributos.vida}</span>
                </div>
                <div class="glass p-6 rounded-3xl col-span-2 text-left">
                    <h4 class="text-[10px] text-purple-400 font-black uppercase mb-2">Legado</h4>
                    <p class="text-sm text-slate-300 italic">${ficha.textos.legado || '...'}</p>
                </div>
            </div>
        </div>
    `;
}

// --- EDIÇÃO ---
function abrirCriacao(id = null) {
    document.getElementById('ficha-id').value = id || '';
    if (id) {
        const f = jogadores.find(j => j.id === id);
        document.getElementById('ficha-nome').value = f.nome;
        document.getElementById('ficha-classe').value = f.classe;
        document.getElementById('ficha-imagem').value = f.imagem;
        document.getElementById('attr-vida').value = f.atributos.vida;
        document.getElementById('txt-legado').value = f.textos.legado;
        document.getElementById('txt-heranca').value = f.textos.heranca;
        document.getElementById('txt-antecedente').value = f.textos.antecedente;
    }
    mudarTela('tela-criacao');
}

function editarFichaAtiva() {
    abrirCriacao(fichaAtivaId);
}

function matarFicha(id) {
    const f = jogadores.find(j => j.id === id);
    cemiterio.push(f);
    jogadores = jogadores.filter(j => j.id !== id);
    localStorage.setItem('fichas_skyfall_v2', JSON.stringify(jogadores));
    localStorage.setItem('memorial_skyfall_v2', JSON.stringify(cemiterio));
    renderizarSelecao();
}

// Início
window.onload = () => renderizarSelecao();
