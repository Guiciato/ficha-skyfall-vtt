// --- ESTADO DA APLICAÇÃO (LocalStorage) ---
let jogadores = JSON.parse(localStorage.getItem('skyfall_fichas')) || [];
let cemiterio = JSON.parse(localStorage.getItem('skyfall_memorial')) || [];
let fichaAtivaId = null;

// --- NAVEGAÇÃO ENTRE TELAS ---
function mudarTela(telaId) {
    const telas = ['tela-selecao', 'tela-criacao', 'tela-dashboard', 'tela-memorial'];
    telas.forEach(id => document.getElementById(id).classList.add('escondido'));
    document.getElementById(telaId).classList.remove('escondido');
    
    if (telaId === 'tela-selecao') renderizarSelecao();
    if (telaId === 'tela-memorial') renderizarMemorial();
    if (telaId === 'tela-dashboard') renderizarDashboard();
}

// --- 2. CRIAÇÃO E EDIÇÃO ---
function abrirCriacao(id = null) {
    document.getElementById('ficha-id').value = id || '';
    
    if (id) {
        // Carrega dados se for edição
        const f = jogadores.find(j => j.id === id);
        document.getElementById('ficha-nome').value = f.nome;
        document.getElementById('ficha-classe').value = f.classe;
        document.getElementById('ficha-imagem').value = f.imagem || '';
        document.getElementById('attr-vida').value = f.atributos.vida;
        document.getElementById('attr-for').value = f.atributos.forca;
        document.getElementById('attr-des').value = f.atributos.destreza;
        document.getElementById('txt-legado').value = f.historia || '';
    } else {
        // Limpa tudo se for ficha nova
        document.getElementById('ficha-nome').value = '';
        document.getElementById('ficha-classe').value = '';
        document.getElementById('ficha-imagem').value = '';
        document.getElementById('attr-vida').value = 20;
        document.getElementById('attr-for').value = 0;
        document.getElementById('attr-des').value = 0;
        document.getElementById('txt-legado').value = '';
    }
    mudarTela('tela-criacao');
}

function salvarFichaComAtributos() {
    const idExistente = document.getElementById('ficha-id').value;
    
    const novaFicha = {
        id: idExistente ? parseInt(idExistente) : Date.now(),
        nome: document.getElementById('ficha-nome').value || "Herói Desconhecido",
        classe: document.getElementById('ficha-classe').value || "Sem Classe",
        imagem: document.getElementById('ficha-imagem').value,
        atributos: {
            vida: document.getElementById('attr-vida').value || 20,
            forca: document.getElementById('attr-for').value || 0,
            destreza: document.getElementById('attr-des').value || 0,
        },
        historia: document.getElementById('txt-legado').value
    };

    if (idExistente) {
        const index = jogadores.findIndex(j => j.id === novaFicha.id);
        jogadores[index] = novaFicha;
    } else {
        jogadores.push(novaFicha);
    }

    localStorage.setItem('skyfall_fichas', JSON.stringify(jogadores));
    mudarTela('tela-selecao');
}

// --- 1. TELA DE SELEÇÃO ---
function renderizarSelecao() {
    const container = document.getElementById('lista-fichas');
    let html = '';

    jogadores.forEach(j => {
        html += `
            <div class="relative group w-48 h-64 glass rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:-translate-y-2 transition-all shadow-2xl">
                <div onclick="abrirDashboard(${j.id})" class="flex flex-col items-center p-4 w-full h-full justify-center">
                    <img src="${j.imagem || 'https://via.placeholder.com/150'}" class="w-24 h-24 rounded-full object-cover mb-4 border-2 border-amber-500/20 group-hover:border-amber-500 transition-all">
                    <h3 class="font-serif font-black text-amber-500 text-sm uppercase text-center drop-shadow-md">${j.nome}</h3>
                    <p class="text-[9px] text-slate-400 uppercase mt-1 tracking-widest">${j.classe}</p>
                </div>
                
                <div class="absolute -top-3 -right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button onclick="matarFicha(${j.id})" title="Enviar ao Memorial" class="bg-red-950 border border-red-500/50 text-red-500 p-2.5 rounded-full text-xs hover:bg-red-600 hover:text-white shadow-lg">💀</button>
                    <button onclick="excluirFichaPermanente(${j.id})" title="Excluir Definitivamente" class="bg-slate-900 border border-slate-600 text-slate-400 p-2.5 rounded-full text-xs hover:bg-white hover:text-black shadow-lg">🗑️</button>
                </div>
            </div>
        `;
    });

    // 1.4 Criar Nova
    html += `
        <div onclick="abrirCriacao()" class="w-48 h-64 border-2 border-dashed border-amber-500/30 rounded-[2rem] flex flex-col items-center justify-center text-amber-500/50 hover:text-amber-500 hover:border-amber-500 hover:bg-amber-500/5 transition-all cursor-pointer glass">
            <span class="text-5xl mb-2">+</span>
            <p class="text-[10px] font-black uppercase tracking-widest">Nova Ficha</p>
        </div>
    `;
    container.innerHTML = html;
}

// Ações de Exclusão da Tela 1
function matarFicha(id) {
    const f = jogadores.find(j => j.id === id);
    cemiterio.push(f);
    jogadores = jogadores.filter(j => j.id !== id);
    atualizarStorage();
    renderizarSelecao();
}

function excluirFichaPermanente(id) {
    if (confirm("Deseja apagar essa ficha para sempre?")) {
        jogadores = jogadores.filter(j => j.id !== id);
        atualizarStorage();
        renderizarSelecao();
    }
}

// --- 3. DASHBOARD ---
function abrirDashboard(id) {
    fichaAtivaId = id;
    mudarTela('tela-dashboard');
}

function renderizarDashboard() {
    const f = jogadores.find(j => j.id === fichaAtivaId);
    if (!f) return mudarTela('tela-selecao');

    document.getElementById('dashboard-info').innerHTML = `
        <div class="flex flex-col items-center">
            ${f.imagem ? `<img src="${f.imagem}" class="w-40 h-40 rounded-full object-cover border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6">` : ''}
            <h1 class="text-7xl font-serif font-black text-amber-500 uppercase italic drop-shadow-2xl">${f.nome}</h1>
            <p class="text-slate-300 font-bold uppercase tracking-[0.4em] text-sm mb-12 drop-shadow-md">${f.classe}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div class="glass p-6 rounded-[2rem] flex flex-col items-center justify-center">
                    <h4 class="text-[10px] text-pink-500 font-black uppercase mb-2 tracking-widest">HP Máximo</h4>
                    <span class="text-5xl font-serif font-black text-white">${f.atributos.vida}</span>
                </div>
                
                <div class="glass p-6 rounded-[2rem] flex justify-around items-center">
                    <div class="text-center">
                        <p class="text-[10px] text-amber-500 font-black uppercase mb-2">FOR</p>
                        <span class="text-3xl font-serif font-black text-white">${f.atributos.forca >= 0 ? '+'+f.atributos.forca : f.atributos.forca}</span>
                    </div>
                    <div class="text-center">
                        <p class="text-[10px] text-amber-500 font-black uppercase mb-2">DES</p>
                        <span class="text-3xl font-serif font-black text-white">${f.atributos.destreza >= 0 ? '+'+f.atributos.destreza : f.atributos.destreza}</span>
                    </div>
                </div>

                <div class="glass p-6 rounded-[2rem] text-left max-h-[200px] overflow-y-auto">
                    <h4 class="text-[10px] text-purple-400 font-black uppercase mb-2 tracking-widest">História</h4>
                    <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">${f.historia || 'Nenhum registro.'}</p>
                </div>
            </div>
        </div>
    `;
}

function editarFichaAtiva() {
    abrirCriacao(fichaAtivaId); // 3.2 Menu de Edição
}

// --- 4. MEMORIAL ---
function renderizarMemorial() {
    const container = document.getElementById('lista-cemiterio');
    if (cemiterio.length === 0) {
        container.innerHTML = '<p class="text-slate-500 col-span-full text-center tracking-widest uppercase font-bold text-xs">Nenhum herói tombado.</p>';
        return;
    }

    let html = '';
    cemiterio.forEach(h => {
        html += `
        <div class="glass p-6 rounded-[2rem] flex flex-col items-center group relative overflow-hidden border-red-900/30">
            <img src="${h.imagem || 'https://via.placeholder.com/150'}" class="w-20 h-20 rounded-full object-cover grayscale opacity-50 mb-4 border border-red-900">
            <h3 class="font-black text-red-500 uppercase text-center text-sm mb-6">${h.nome}</h3>
            
            <div class="flex gap-2 absolute -bottom-16 group-hover:bottom-6 transition-all">
                <button onclick="reviverFicha(${h.id})" class="bg-red-950 border border-red-900 text-[9px] font-black text-red-500 uppercase px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white shadow-lg">Reviver</button>
                <button onclick="excluirDoMemorial(${h.id})" class="bg-black/80 border border-white/10 text-[9px] font-black text-slate-500 uppercase px-4 py-2 rounded-xl hover:bg-white hover:text-black shadow-lg">Apagar</button>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
}

function reviverFicha(id) {
    const f = cemiterio.find(h => h.id === id);
    jogadores.push(f);
    cemiterio = cemiterio.filter(h => h.id !== id);
    atualizarStorage();
    renderizarMemorial();
}

function excluirDoMemorial(id) {
    if (confirm("Esta ação apagará a ficha do memorial para sempre. Confirmar?")) {
        cemiterio = cemiterio.filter(h => h.id !== id);
        atualizarStorage();
        renderizarMemorial();
    }
}

// Utilitário para salvar
function atualizarStorage() {
    localStorage.setItem('skyfall_fichas', JSON.stringify(jogadores));
    localStorage.setItem('skyfall_memorial', JSON.stringify(cemiterio));
}

// Iniciar
window.onload = () => renderizarSelecao();
