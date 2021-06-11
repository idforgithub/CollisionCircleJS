let canvas = document.querySelector("canvas")

canvas.width = innerWidth
canvas.height = innerHeight

let context = canvas.getContext('2d')

let mouseVector = {
    x: undefined,
    y: undefined
}

addEventListener('mousemove', function (event) {
    mouseVector.x = event.x
    mouseVector.y = event.y
})

addEventListener('mouseout', function (event) {
    mouseVector.x = undefined
    mouseVector.y = undefined
})

class Circle{

    velocity = {
        x: undefined,
        y: undefined
    }

    //speedX = undefined
    //speedY = undefined

    tick = 1
    mass = 1

    constructor(x = 0, y = 0, radius = 0, color = 'black'){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color

        this.#fixPosition()
        this.randomSpeed(false)
    }

    #fixPosition(){
        this.x = (this.x + this.radius) > innerWidth ? (this.x - this.radius) : this.x
        this.x = (this.x - this.radius) < 0 ? (this.x + this.radius) : this.x
        
        this.y = (this.y + this.radius > innerHeight) ? (this.y - this.radius) : this.y
        this.y = (this.y - this.radius) < 0 ? (this.y + this.radius) : this.y
    }

    randomSpeed(isRandom = true){
        this.velocity.x = (isRandom ? Math.random().toFixed(1) : 1) * (Math.random() < 0.5 ? this.tick : -this.tick)
        this.velocity.y = (isRandom ? Math.random().toFixed(1) : 1) * (Math.random() < 0.5 ? this.tick : -this.tick)
    }

    number = undefined
    setNumber(setIndex = 0){
        this.number = setIndex
    }

    draw(){
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.pow(Math.PI, 2))
        context.fillStyle = this.color

        if(undefined != this.number){
            context.font = "10px Arial"
            context.fillText(""+this.number, this.x, this.y)
        }

        context.fill()
        context.closePath()
    }

    circleArray = []
    setCollide(circles){
        this.circleArray = circles
    }

    rotate(velocity = {x: undefined, y: undefined}, angle = undefined){
        return {
            x: (velocity.x * Math.cos(angle)) - (velocity.y * Math.sin(angle)),
            y: (velocity.x * Math.sin(angle)) - (velocity.y * Math.cos(angle)),
        }
    }

    resolveCollision(otherCircle){
        const xVelocityDiff = this.velocity.x - otherCircle.velocity.x
        const yVelocityDiff = this.velocity.y - otherCircle.velocity.y

        const xDist = this.x - otherCircle.x
        const yDist = this.y - otherCircle.y

        if( xVelocityDiff * xDist + yVelocityDiff * yDist >= 0){
            const angle = -Math.atan2(otherCircle.y - this.y, otherCircle.x - this.x)

            const m1 = this.mass
            const m2 = otherCircle.mass

            console.log(m1)
            console.log(m2)

            const u1 = this.rotate(this.velocity, angle)
            const u2 = this.rotate(otherCircle.velocity, angle)

            const v1 = { 
                x: (u1.x * (m1 - m2) + ((m2 * 2) * u2.x)) / (m1 + m2),
                y: u1.y
            }
            const v2 = {
                x: (u2.x * (m2 - m1) + ((m1 * 2) * u1.x)) / (m1 + m2),
                y: u2.y
            }

            const finalVelolicy1 = this.rotate(v1, -angle)
            const finalVelolicy2 = this.rotate(v2, -angle)

            this.velocity.x = finalVelolicy1.x
            this.velocity.y = finalVelolicy1.y

            otherCircle.velocity.x = finalVelolicy2.x
            otherCircle.velocity.y = finalVelolicy2.y
        }
    }

    collideUpdate(){
        if(this.circleArray.length != 0){
            this.circleArray.forEach(circleFromArray => {
                if(this !== circleFromArray){
                    const distanceVal = distanceBetweenCircle(this, circleFromArray) - this.radius * 2//Math.hypot(this.radius, circleFromArray.radius) * 2
                    if(distanceVal < 0){
                        //this.resolveCollision(circleFromArray)
                        console.log("collide")
                    }
                }
                
            })
        }
        this.update()
    }

    update(){
        if( this.x + this.radius > innerWidth || this.x - this.radius < 0)
            this.velocity.x = -this.velocity.x
        
        if( this.y + this.radius > innerHeight || this.y - this.radius < 0)
            this.velocity.y = -this.velocity.y
        
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.draw()
    }
}

function strColorRGBA(red = 0, green = 0, blue = 0, alpha = 1.0) {
    return "rgba("+red+", "+green+", "+blue+", "+alpha+")"
}

function randomNumber(number1, number2, rounding = false) {
    return rounding ? 
        Math.floor( randomNumber(number1, number2, false)) : 
        Math.random() * (number2 - number1) + number1
}

const circles = []

function instantiate(target = 0, index = 0) {
    if(index < target){
        let rngRadius = 100//randomNumber(20, 50)
        let circle = new Circle(
            randomNumber(rngRadius, innerWidth - rngRadius), 
            randomNumber(rngRadius, innerHeight - rngRadius),
            rngRadius, 
            strColorRGBA(
                randomNumber(0, 255, true),
                randomNumber(0, 255, true),
                randomNumber(0, 255, true),
                randomNumber(0.2, 1.0),
            )
        )
        circle.tick = randomNumber(5, 10)
        circle.randomSpeed()
        //circle.setNumber(index)

        circles.push( checkElement(circle) )
        if(circles.length != 0){
            circle.setCollide(circles)
        }
        
        return instantiate(target, index+1)
    }
}

// if using recursive it will reach maximum callback!!!
function checkElement(circle) {
    if(0 == circles.length)
        return circle
    
    circles.forEach(circleFromArray => {
        const distanceVal = distanceBetweenCircle(circle, circleFromArray) - this.radius * 2//Math.hypot(circle.radius, circleFromArray.radius) * 2
        if(distanceVal < 0){
            circle.x = randomNumber(circle.radius, innerWidth - circle.radius, true)
            circle.y = randomNumber(circle.radius, innerHeight - circle.radius, true)
            return checkElement(circle)
        }
    })
    return circle
}

function distanceBetweenCircle(circle1, circle2) {
    return calculateDistance(circle1.x, circle1.y, circle2.x, circle2.y)
}

function calculateDistance(x1 = 0, y1 = 0, x2 = 0, y2 = 0){
    return Math.hypot(x1 -x2, y1 - y2)
}

function animation(){
    requestAnimationFrame(animation)
    context.clearRect(0, 0, canvas.width, canvas.height)

    circles.forEach(c => {
        c.collideUpdate(circles)
    })
}

// target = (how much circle to instantiate)
instantiate(target = 2)
// run animation
animation()