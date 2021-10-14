import fs from 'fs';
// import { stdin } from 'process';
import readline from 'readline';

const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getInput(question) {
    return new Promise((resolve, reject) => {
        input.question(question, (answer) => {
            resolve(answer);
        })
    })
}

function readFile(path) {
    try {
        return fs.readFileSync(path, 'utf8');
    } catch (error) {
        return;
    }
}

function isAtribuition(char) {
    if(streak[0] == '=')
        return false
    return char == '=';
}

function isComparation(char) {
    return char == '>' || char == '<' || char == '=';
}

function isAlphaNumeric(char) {
    if ((streak.length === 0 && isLetter(char)) || (isLetter(streak[0]) && (isLetter(char) || isDigit(char))))
        return true;
    else
        return false;
}

function isDigit(char) {
    return char >= '0' && char <= '9';
}

function isLetter(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char == '_';
}

function isEOF(char) {
    return char == '';
}

function isTabOrNewLine(char) {
    return char == '\r' || char == '\t' || char == '\n';
}

function isSpace(char) {
    return char == ' ';
}

function isPontuation(char) {
    return char == ';' || char == ',' || char == '(' || char == ')' || char == '{' || char == '}' || char == '[' || char == ']' || char == '.' || char == ':' || char == '?' || char == '!' || char == '\'' || char == '"' || char == '`';
}

function isArithimeticOperator(char) {
    return char == '+' || char == '-' || char == '*' || char == '/' || char == '%';
}

function isReservedWord() {
    const reservedWords = ['if', 'else', 'while', 'do', 'for', 'break', 'continue', 'return', 'function', 'true', 'false', 'null', 'this', 'print'];
    return reservedWords.includes(streak.join(''));
}

function isVariable() {
    const reservedWords = ['const', 'let', 'var'];
    return reservedWords.includes(streak.join(''))
}

function findStage(token) {
    let newState, stage;
    for (let i = 0; i < stages.length; i++) {
        stage = stages[i];
        newState = stage(token);
        if (newState) {
            newState = i + 1;
            break;
        }
    }
    return newState;
}

const stages = [isAlphaNumeric, isDigit, isAtribuition, isComparation, isPontuation, isArithimeticOperator, isTabOrNewLine, isEOF, isSpace];

let streak = []

function verifyState(token, thisState) {
    let newState, currentTokenType;

    const TOKENS = ['TK_IDENTIFIER', 'TK_NUMBER', 'TK_ATRIB', 'TK_COMPARATION', 'TK_PONTUATION', 'TK_ARITHIMETIC', 'TK_TABORNEWLINE', 'TK_EOF', 'TK_ZERO'];

    newState = thisState > 0 ? (thisState - 1) : 0;
    let continueInState = stages[newState](token)
    if (!continueInState)
        if(isSpace(token) || isTabOrNewLine(token) || isPontuation(token))
            streak = [];
        newState = findStage(token);

    currentTokenType = TOKENS[newState - 1];

    if (!isSpace(token) && !isTabOrNewLine(token) && !isPontuation(token)) {
        streak.push(token)
        isReservedWord() && (currentTokenType = 'TK_RESERVED_WORD')
        isVariable() && (currentTokenType = 'TK_VARIABLE')
    }
    else
        streak = [];

    if(newState > 8 || newState <= 0){
        newState = 0;
        currentTokenType = 'TK_ZERO';
    }
    
    return { state: newState, currentToken: { type: currentTokenType, value: token } };
}

async function lexicalAnalyzer() {
    let currentToken = { type: '', value: '' };
    let state = 0;
    let path = await getInput('Digite o caminho do arquivo: (Deixe em branco para utilizar o arquivo padrão)');
    let file = readFile(path ? path : './input.txt');

    !file && (() => {
        console.log('Arquivo não encontrado');
        process.exit();
    })()

    for (let token of file) {
        ({ state, currentToken } = verifyState(token, state));
        console.log(`Estado: ${state}, Token:${JSON.stringify(currentToken)}`);
    }
    state = 8;
    currentToken = { type: 'TK_EOF', value: '' };
    console.log(`Estado: ${state}, Token:${JSON.stringify(currentToken)}`);
    console.log('Fim do arquivo');
    process.exit();
}

lexicalAnalyzer();