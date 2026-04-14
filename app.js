// --- ESTADO E BANCO DE DADOS (LOCALSTORAGE) ---
let usuarioLogado = sessionStorage.getItem('vtt_user') || null;

let bancoSistemas = JSON.parse(localStorage.getItem('vtt_sistemas')) || [
    { id: 'skyfall', nome: 'Skyfall RPG', atributos: ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'], barras: ['Vida', 'Catarse'] },
    { id: 'tormenta', nome: 'Tormenta20', atributos: ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'], barras: ['PV', 'PM'] }
];

let todasFichas = JSON.parse(localStorage.getItem('vtt_fichas')) || [];
let todoCemiterio = JSON.parse(localStorage.getItem('vtt_memorial')) || [];

let fichaAtivaId = null;

// --- LOGIN ---
window.onload = () => {
    if (!usuarioLogado) mudarTela('tela-login');
    else {
        document.getElementById('display-user').innerText = usuarioLogado;
        carregarSelectSistemas();
        mudarTela('tela-selecao');
    }
}

function fazerLogin() {
    const user = document.getElementById('login-user').value.trim();
    if (user) {
        sessionStorage.setItem('vtt_user', user);
        usuarioLogado = user;
        document.getElementById('display-user').innerText = user;
        carregarSelectSistemas();
        mudarTela('tela-selecao');
    }
}

function fazerLogout() {
    sessionStorage.removeItem('vtt_user');
    usuarioLogado = null;
    mudarTela('tela-login');
}

// --- NAVEGAÇÃO ---
function mudarTela(telaId) {
    const telas = ['tela-login', 'tela-selecao', 'tela-criacao', 'tela-dashboard', 'tela-memorial', 'tela-sistema'];
    telas.forEach(id => document.getElementById(id).classList.add('escondido'));
    document.getElementById(telaId).classList.remove('escondido');
    
    if (telaId === 'tela-selecao') renderizarSelecao();
    if (telaId === 'tela-memorial') renderizarMemorial();
    if (telaId === 'tela-dashboard') renderizarDashboard();
}

// --- 5. SISTEMAS ---
function carregarSelectSistemas() {
    const select = document.getElementById('select-sistema');
    select.innerHTML = bancoSistemas.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
}

function salvarSistema() {
    const nome = document.getElementById('sys-nome').value.trim();
    const attrs = document.getElementById('sys-atributos').value.split(',').map(s => s.trim()).filter(s => s);
    const barras = document.getElementById('sys-barras').value.split(',').map(s => s.trim()).filter(s => s);
    
    if(!nome) return alert("Dê um nome ao sistema!");

    bancoSistemas.push({ id: Date.now().toString(), nome, atributos: attrs, barras });
    localStorage.setItem('vtt_sistemas', JSON.stringify(bancoSistemas));
    
    document.getElementById('sys-nome').value = '';
    document.getElementById('sys-atributos').value = '';
    document.getElementById('sys-barras').value = '';
    
    carregarSelectSistemas();
    mudarTela('tela-selecao');
}

function obterSistemaAtivo() {
    const id = document.getElementById('select-sistema').value;
    return bancoSistemas.find(s => s.id === id);
}

// --- 1. TELA DE SELEÇÃO ---
function renderizarSelecao() {
    const container = document.getElementById('lista-fichas');
    const sysId = document.getElementById('select-sistema').value;
    
    // Filtra fichas do usuário logado e do sistema atual
    const fichasUsuario = todasFichas.filter(f => f.user === usuarioLogado && f.sistemaId === sysId);
    
    let html = '';
    fichasUsuario.forEach(j => {
        html += `
            <div class="relative group w-48 h-64 glass rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:-translate-y-2 transition-all shadow-2xl">
                <div onclick="abrirDashboard(${j.id})" class="flex flex-col items-center p-4 w-full h-full justify-center">
                    <img src="${j.imagem || 'https://via.placeholder.com/150'}" class="w-24 h-24 rounded-full object-cover mb-4 border-2 border-amber-500/20 group-hover:border-amber-500 transition-all">
                    <h3 class="font-serif font-black text-amber-500 text-sm uppercase text-center drop-shadow-md">${j.nome}</h3>
                    <p class="text-[9px] text-slate-400 uppercase mt-1 tracking-widest">${j.classe}</p>
                </div>
                <div class="absolute -top-3 -right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button onclick="matarFicha(${j.id})" class="bg-red-950 border border-red-500/50 text-red-500 p-2.5 rounded-full text-xs hover:bg-red-600 hover:text-white shadow-lg">💀</button>
                    <button onclick="excluirFichaPermanente(${j.id})" class="bg-slate-900 border border-slate-600 text-slate-400 p-2.5 rounded-full text-xs hover:bg-white hover:text-black shadow-lg">🗑️</button>
                </div>
            </div>
        `;
    });

    html += `
        <div onclick="abrirCriacao()" class="w-48 h-64 border-2 border-dashed border-amber-500/30 rounded-[2rem] flex flex-col items-center justify-center text-amber-500/50 hover:text-amber-500 hover:border-amber-500 hover:bg-amber-500/5 transition-all cursor-pointer glass">
            <span class="text-5xl mb-2">+</span>
            <p class="text-[10px] font-black uppercase tracking-widest">Nova Ficha</p>
        </div>
    `;
    container.innerHTML = html;
}

function matarFicha(id) {
    const f = todasFichas.find(j => j.id === id);
    const causa = prompt(`Qual foi a causa da morte de ${f.nome}?`);
    if (causa) {
        f.causaMorte = causa;
        todoCemiterio.push(f);
        todasFichas = todasFichas.filter(j => j.id !== id);
        atualizarStorage();
        renderizarSelecao();
    }
}

function excluirFichaPermanente(id) {
    if (confirm("Deseja apagar essa ficha para sempre?")) {
        todasFichas = todasFichas.filter(j => j.id !== id);
        atualizarStorage();
        renderizarSelecao();
    }
}

// --- 2. CRIAÇÃO DINÂMICA DE FICHA ---
function abrirCriacao(id = null) {
    const sys = obterSistemaAtivo();
    const containerDinamico = document.getElementById('container-atributos-dinamicos');
    
    document.getElementById('ficha-id').value = id || '';
    let htmlDinamico = '';

    // Cria os inputs de Barras
    sys.barras.forEach(b => {
        htmlDinamico += `
            <div class="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                <span class="text-[10px] font-black uppercase text-pink-400 tracking-widest">${b}</span>
                <input type="number" data-tipo="barra" data-nome="${b}" class="w-20 bg-black/60 border border-white/10 rounded-lg p-2 text-center text-white font-serif font-black focus:border-pink-500 outline-none" value="0">
            </div>`;
    });

    // Cria os inputs de Atributos
    sys.atributos.forEach(a => {
        htmlDinamico += `
            <div class="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                <span class="text-[10px] font-black uppercase text-amber-500 tracking-widest">${a}</span>
                <input type="number" data-tipo="atributo" data-nome="${a}" class="w-20 bg-black/60 border border-white/10 rounded-lg p-2 text-center text-white font-serif font-black focus:border-amber-500 outline-none" value="0">
            </div>`;
    });

    containerDinamico.innerHTML = htmlDinamico;

    // Se for edição, preenche os dados
    if (id) {
        const f = todasFichas.find(j => j.id === id);
        document.getElementById('ficha-nome').value = f.nome;
        document.getElementById('ficha-classe').value = f.classe;
        document.getElementById('ficha-imagem').value = f.imagem || '';
        document.getElementById('txt-historia').value = f.historia || '';
        
        // Preenche dinâmicos
        document.querySelectorAll('#container-atributos-dinamicos input').forEach(input => {
            const nome = input.getAttribute('data-nome');
            const tipo = input.getAttribute('data-tipo');
            if(f.dadosDinamicos && f.dadosDinamicos[tipo] && f.dadosDinamicos[tipo][nome] !== undefined) {
                input.value = f.dadosDinamicos[tipo][nome];
            }
        });
    } else {
        document.getElementById('ficha-nome').value = '';
        document.getElementById('ficha-classe').value = '';
        document.getElementById('ficha-imagem').value = '';
        document.getElementById('txt-historia').value = '';
    }

    mudarTela('tela-criacao');
}

function salvarFicha() {
    const idExistente = document.getElementById('ficha-id').value;
    const sysId = document.getElementById('select-sistema').value;
    
    // Coleta dados dinâmicos
    const dadosDinamicos = { barra: {}, atributo: {} };
    document.querySelectorAll('#container-atributos-dinamicos input').forEach(input => {
        const nome = input.getAttribute('data-nome');
        const tipo = input.getAttribute('data-tipo');
        dadosDinamicos[tipo][nome] = input.value;
    });

    const novaFicha = {
        id: idExistente ? parseInt(idExistente) : Date.now(),
        user: usuarioLogado,
        sistemaId: sysId,
        nome: document.getElementById('ficha-nome').value || "Desconhecido",
        classe: document.getElementById('ficha-classe').value || "Sem Classe",
        imagem: document.getElementById('ficha-imagem').value,
        historia: document.getElementById('txt-historia').value,
        dadosDinamicos: dadosDinamicos
    };

    if (idExistente) {
        const index = todasFichas.findIndex(j => j.id === novaFicha.id);
        todasFichas[index] = novaFicha;
    } else {
        todasFichas.push(novaFicha);
    }

    atualizarStorage();
    mudarTela('tela-selecao');
}

// --- 3. DASHBOARD ---
function abrirDashboard(id) {
    fichaAtivaId = id;
    mudarTela('tela-dashboard');
}

function renderizarDashboard() {
    const f = todasFichas.find(j => j.id === fichaAtivaId);
    if (!f) return mudarTela('tela-selecao');

    let htmlBarras = '';
    for (const [nome, valor] of Object.entries(f.dadosDinamicos.barra)) {
        htmlBarras += `
            <div class="glass p-6 rounded-[2rem] flex flex-col items-center justify-center">
                <h4 class="text-[10px] text-pink-500 font-black uppercase mb-2 tracking-widest">${nome}</h4>
                <span class="text-5xl font-serif font-black text-white">${valor}</span>
            </div>`;
    }

    let htmlAtributos = '';
    for (const [nome, valor] of Object.entries(f.dadosDinamicos.atributo)) {
        htmlAtributos += `
            <div class="text-center p-2">
                <p class="text-[10px] text-amber-500 font-black uppercase mb-1">${nome}</p>
                <span class="text-2xl font-serif font-black text-white">${valor >= 0 ? '+'+valor : valor}</span>
            </div>`;
    }

    document.getElementById('dashboard-info').innerHTML = `
        <div class="flex flex-col items-center">
            ${f.imagem ? `<img src="${f.imagem}" class="w-40 h-40 rounded-full object-cover border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6">` : ''}
            <h1 class="text-7xl font-serif font-black text-amber-500 uppercase italic drop-shadow-2xl">${f.nome}</h1>
            <p class="text-slate-300 font-bold uppercase tracking-[0.4em] text-sm mb-12 drop-shadow-md">${f.classe}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                ${htmlBarras}
                <div class="glass p-4 rounded-[2rem] flex flex-wrap justify-around items-center col-span-1 md:col-span-2">
                    ${htmlAtributos}
                </div>
                <div class="glass p-6 rounded-[2rem] text-left col-span-1 md:col-span-3">
                    <h4 class="text-[10px] text-purple-400 font-black uppercase mb-2 tracking-widest">História</h4>
                    <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">${f.historia || 'Nenhum registro.'}</p>
                </div>
            </div>
        </div>
    `;
}

function editarFichaAtiva() { abrirCriacao(fichaAtivaId); }

// --- 4. MEMORIAL ---
function renderizarMemorial() {
    const container = document.getElementById('lista-cemiterio');
    const sysId = document.getElementById('select-sistema').value;
    const mortosUsuario = todoCemiterio.filter(f => f.user === usuarioLogado && f.sistemaId === sysId);

    if (mortosUsuario.length === 0) return container.innerHTML = '<p class="text-slate-500 col-span-full text-center tracking-widest uppercase font-bold text-xs">Nenhum herói tombado.</p>';

    let html = '';
    mortosUsuario.forEach(h => {
        html += `
        <div class="glass p-6 rounded-[2rem] flex flex-col items-center group relative overflow-hidden border-red-900/30">
            <img src="${h.imagem || 'https://via.placeholder.com/150'}" class="w-20 h-20 rounded-full object-cover grayscale opacity-50 mb-4 border border-red-900">
            <h3 class="font-black text-red-500 uppercase text-center text-sm mb-1">${h.nome}</h3>
            <p class="text-[9px] text-slate-400 italic text-center mb-6 px-2">"Morto por: ${h.causaMorte || 'Desconhecido'}"</p>
            
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
    const f = todoCemiterio.find(h => h.id === id);
    todasFichas.push(f);
    todoCemiterio = todoCemiterio.filter(h => h.id !== id);
    atualizarStorage();
    renderizarMemorial();
}

function excluirDoMemorial(id) {
    if (confirm("Esta ação apagará a ficha do memorial para sempre. Confirmar?")) {
        todoCemiterio = todoCemiterio.filter(h => h.id !== id);
        atualizarStorage();
        renderizarMemorial();
    }
}

// Utilitário 
function atualizarStorage() {
    localStorage.setItem('vtt_fichas', JSON.stringify(todasFichas));
    localStorage.setItem('vtt_memorial', JSON.stringify(todoCemiterio));
}
