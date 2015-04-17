import React from 'react';
import classnames from 'classnames';
import Immutable from 'immutable';
import {close, tick, cross} from './svgs.jsx!';
import {nthLetter} from './utils';

class Answer extends React.Component {
    handleChange(event) {
        this.props.setText(event.target.value);
    }

    handleRevealChange(event) {
        this.props.setReveal(event.target.value);
    }

    render() {
        const answer = this.props.answer;
        const answerText = answer.get('answer');
        const letter = nthLetter(this.props.index);
        const isCorrect = answer.get('correct');
        const classes = classnames({
            'quiz-builder__answer': true,
            'quiz-builder__answer--correct': isCorrect
        });
        const icon = isCorrect ? tick : cross;

        const header = isCorrect ? <span>{icon} {letter}.</span> : <button className="quiz-builder__correct-toggle" onClick={this.props.setCorrect}>{icon} {letter}.</button>;

        const revealText = isCorrect && <input className="quiz-builder__reveal-text" value={this.props.revealText} placeholder="Enter reveal text here..." onChange={this.handleRevealChange.bind(this)} />;
        
        return <div className={classes}>
            <h4 className="quiz-builder__answer-letter">{header}</h4>
            <input className="quiz-builder__answer-text" value={answerText} placeholder="Enter answer text here..." onChange={this.handleChange.bind(this)} />
            {revealText}
        </div>;
    }
}

class Question extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isExpanded: false
        };
    }

    handleQuestionTextChange(event) {
        this.props.setText(event.target.value);
    }
    
    render() {
        const question = this.props.question;
        let answersData = question.get('multiChoiceAnswers');
        let answers;

        if (answersData.size > 0) {
            answers = <div className="quiz-builder__answers">
                {answersData.map((answer, index) => <Answer answer={answer} index={index} key={`answer_${index + 1}`} setText={this.props.setAnswerText(index)} setCorrect={this.props.setAnswerCorrect.bind(null, index)} setReveal={this.props.setRevealText} revealText={question.get('more')} />).toJS()}
            </div>
        }
            
        return <div className="quiz-builder__question">
            <h2 className="quiz-builder__question-number">Question {this.props.index}.</h2>
            <input className="quiz-builder__question-text" value={question.get('question')} placeholder="Enter question text here..." onChange={this.handleQuestionTextChange.bind(this)} />

            <h3>Answers</h3>
            
            {answers}

            <button className="quiz-builder__button" onClick={this.props.addAnswer}>Add answer</button>

            <button className="quiz-builder__question-close" onClick={this.props.onClose}>{close(18)}</button>
        </div>;
    }
}

class JSONViewer extends React.Component {
    render() {
        const json = JSON.stringify(this.props.data, null, 4);
        
        return <textarea className="quiz-builder__json-viewer" value={json} readOnly />;
    }
}

export class QuizBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = Immutable.fromJS({
            questions: []
        });
    }

    updateState(f) {
        const nextState = f(this.state);

        if (nextState !== this.state) {
            this.state = nextState;
            this.forceUpdate();
        }
    }

    deleteQuestion(n) {
        return () => this.updateState(state => state.update(
            'questions',
            questions => questions.remove(n)
        ));
    }

    setQuestionText(n) {
        return (text) => this.updateState(state => state.updateIn(
            ['questions', n],
            question => question.set('question', text)
        ));
    }

    addAnswer(questionNumber) {
        return () => this.updateState(state => state.updateIn(
            ['questions', questionNumber],
            question => question.update(
                'multiChoiceAnswers',
                answers => answers.push(Immutable.fromJS({
                    answer: "",
                    imageUrl: "",
                    correct: answers.size === 0
                }))
            )
        ));
    }

    setAnswerText(questionNumber) {
        return (answerNumber) => (text) => this.updateState(state => state.updateIn(
            ['questions', questionNumber, 'multiChoiceAnswers', answerNumber],
            answer => answer.set('answer', text)
        ));
    }

    setAnswerCorrect(questionNumber) {
        return (answerNumber) => this.updateState(state => state.updateIn(
            ['questions', questionNumber, 'multiChoiceAnswers'],
            answers => answers.map((answer, i) => answer.set('correct', i === answerNumber))
        ));
    }

    setRevealText(questionNumber) {
        return (text) => this.updateState(state => state.setIn(
            ['questions', questionNumber, 'more'],
            text
        ));
    }

    addQuestion() {
        this.updateState(state => state.update(
            'questions', 
            questions => questions.push(Immutable.fromJS({
                question: "",
                more: "",
                multiChoiceAnswers: []
            }))
        ));
    }
    
    render() {
        const questions = this.state.get('questions')
            .map((question, i) => <Question question={question} 
                 key={`question_${i + 1}`} 
                 index={i + 1} 
                 onClose={this.deleteQuestion(i)} 
                 setText={this.setQuestionText(i)}
                 setAnswerText={this.setAnswerText(i)}
                 setAnswerCorrect={this.setAnswerCorrect(i)}
                 setRevealText={this.setRevealText(i)}
                 addAnswer={this.addAnswer(i)} />)
            .toJS();
        const json = this.state.toJS();

        let questionsHtml;

        if (questions.length > 0) {
            questionsHtml = <div className="quiz-builder__questions">
                {questions}
            </div>;
        } else {
            questionsHtml = <p>Add some questions to get started!</p>
        }
        
        return <div className="quiz-builder">
            {questionsHtml}

            <button className="quiz-builder__button" onClick={this.addQuestion.bind(this)}>New question</button>

            <JSONViewer data={json} />
        </div>;
    }
}
