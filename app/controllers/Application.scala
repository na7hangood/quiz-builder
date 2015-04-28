package controllers

import _root_.data.QuizTable
import play.api._
import play.api.libs.json.Json
import play.api.mvc._
import scala.concurrent.ExecutionContext.Implicits.global

object Application extends Controller {
  def launchApp(ignoredParam: String) = Action {
    Ok(views.html.index())
  }

  def listQuizzes = Action.async {
    QuizTable.list() map { entries =>
      Ok(Json.toJson(ListQuizzesResponse(entries)))
    }
  }

  def getQuiz(id: String) = Action.async {
    QuizTable.get(id) map { response =>
      (for {
        entry <- response
        quiz <- entry.quiz
      } yield GetQuizResponse(entry.createdBy, entry.createdAt, entry.updatedBy, entry.updatedAt, quiz)) match {
        case Some(reply) => Ok(Json.toJson(reply))

        case None => NotFound(s"Could not find quiz with id $id")
      }
    }
  }
}
